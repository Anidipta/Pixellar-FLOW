// Pixeller Smart Contract for Flow Blockchain
// This contract manages pixel art NFTs with publish fees and marketplace functionality

import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

pub contract Pixeller: NonFungibleToken {

    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event ArtworkPublished(id: UInt64, creator: Address, artworkCode: String, publishFee: UFix64)
    pub event ArtworkPurchased(id: UInt64, buyer: Address, seller: Address, price: UFix64)
    pub event PlatformFeesWithdrawn(amount: UFix64, to: Address)

    // Named Paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath
    pub let AdminStoragePath: StoragePath

    // Contract state
    pub var totalSupply: UInt64
    access(self) var platformFeeVault: @FlowToken.Vault

    // Artwork NFT Resource
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let artworkCode: String // 14 character code (9 profile + 5 random)
        pub let creator: Address
        pub let title: String
        pub let description: String
        pub let pixelData: String // JSON string of pixel art
        pub let width: UInt64
        pub let height: UInt64
        pub let unlockPassword: String // 6 character password
        pub let price: UFix64
        pub let publishFee: UFix64
        pub let createdAt: UFix64
        pub let thumbnailUrl: String

        init(
            id: UInt64,
            artworkCode: String,
            creator: Address,
            title: String,
            description: String,
            pixelData: String,
            width: UInt64,
            height: UInt64,
            unlockPassword: String,
            price: UFix64,
            publishFee: UFix64,
            thumbnailUrl: String
        ) {
            self.id = id
            self.artworkCode = artworkCode
            self.creator = creator
            self.title = title
            self.description = description
            self.pixelData = pixelData
            self.width = width
            self.height = height
            self.unlockPassword = unlockPassword
            self.price = price
            self.publishFee = publishFee
            self.createdAt = getCurrentBlock().timestamp
            self.thumbnailUrl = thumbnailUrl
        }

        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.title,
                        description: self.description,
                        thumbnail: MetadataViews.HTTPFile(url: self.thumbnailUrl)
                    )
            }
            return nil
        }
    }

    // Collection Resource Interface
    pub resource interface PixellerCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowPixellerNFT(id: UInt64): &Pixeller.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow Pixeller reference: The ID of the returned reference is incorrect"
            }
        }
    }

    // Collection Resource
    pub resource Collection: PixellerCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) 
                ?? panic("NFT not found in collection")
            
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @Pixeller.NFT
            let id: UInt64 = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        pub fun borrowPixellerNFT(id: UInt64): &Pixeller.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &Pixeller.NFT
            }
            return nil
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let pixellerNFT = nft as! &Pixeller.NFT
            return pixellerNFT as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // Public function to create empty collection
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    // Minter Resource - for publishing artworks
    pub resource NFTMinter {
        
        // Publish artwork with fee payment to contract
        pub fun publishArtwork(
            artworkCode: String,
            creator: Address,
            title: String,
            description: String,
            pixelData: String,
            width: UInt64,
            height: UInt64,
            unlockPassword: String,
            price: UFix64,
            publishFeePayment: @FlowToken.Vault,
            thumbnailUrl: String
        ): @Pixeller.NFT {
            
            let publishFee = publishFeePayment.balance
            
            // Deposit publish fee to platform vault
            Pixeller.platformFeeVault.deposit(from: <-publishFeePayment)
            
            let newNFT <- create NFT(
                id: Pixeller.totalSupply,
                artworkCode: artworkCode,
                creator: creator,
                title: title,
                description: description,
                pixelData: pixelData,
                width: width,
                height: height,
                unlockPassword: unlockPassword,
                price: price,
                publishFee: publishFee,
                thumbnailUrl: thumbnailUrl
            )

            emit ArtworkPublished(
                id: Pixeller.totalSupply,
                creator: creator,
                artworkCode: artworkCode,
                publishFee: publishFee
            )

            Pixeller.totalSupply = Pixeller.totalSupply + 1

            return <-newNFT
        }
    }

    // Admin Resource - for contract owner
    pub resource Admin {
        
        // Withdraw platform fees to contract owner's wallet
        pub fun withdrawPlatformFees(amount: UFix64, recipient: &{FungibleToken.Receiver}) {
            let withdrawnVault <- Pixeller.platformFeeVault.withdraw(amount: amount)
            
            emit PlatformFeesWithdrawn(amount: amount, to: recipient.owner?.address!)
            
            recipient.deposit(from: <-withdrawnVault)
        }

        pub fun getPlatformBalance(): UFix64 {
            return Pixeller.platformFeeVault.balance
        }

        pub fun createMinter(): @NFTMinter {
            return <-create NFTMinter()
        }
    }

    // Initialize contract
    init() {
        self.totalSupply = 0
        self.platformFeeVault <- FlowToken.createEmptyVault() as! @FlowToken.Vault

        self.CollectionStoragePath = /storage/PixellerCollection
        self.CollectionPublicPath = /public/PixellerCollection
        self.MinterStoragePath = /storage/PixellerMinter
        self.AdminStoragePath = /storage/PixellerAdmin

        // Create and store Admin resource
        let admin <- create Admin()
        self.account.save(<-admin, to: self.AdminStoragePath)

        // Create and store Minter resource
        let minter <- create NFTMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)

        // Create and link public collection
        let collection <- create Collection()
        self.account.save(<-collection, to: self.CollectionStoragePath)
        self.account.link<&Pixeller.Collection{NonFungibleToken.CollectionPublic, Pixeller.PixellerCollectionPublic, MetadataViews.ResolverCollection}>(
            self.CollectionPublicPath,
            target: self.CollectionStoragePath
        )

        emit ContractInitialized()
    }
}