import re
from pathlib import Path

env_path = Path(__file__).parent / '.env'
if not env_path.exists():
    print('.env not found')
    raise SystemExit(1)

text = env_path.read_text()
lines = [l.strip() for l in text.splitlines() if l.strip()]

vars = {}
for l in lines:
    if '=' in l:
        k, v = l.split('=', 1)
        vars[k.strip()] = v.strip()

hex_re = re.compile(r'^[0-9a-fA-F]+$')

def check_key(name, val, expected_len=None):
    if not val:
        print(f'{name}: MISSING')
        return False
    if val.startswith('0x'):
        v = val[2:]
    else:
        v = val
    if not hex_re.match(v):
        print(f'{name}: INVALID HEX -> {val}')
        return False
    if expected_len and len(v) != expected_len:
        print(f'{name}: INVALID LENGTH {len(v)} (expected {expected_len})')
        return False
    print(f'{name}: OK ({len(v)} hex chars)')
    return True

ok = True
ok &= check_key('EMULATOR_PRIVATE_KEY', vars.get('EMULATOR_PRIVATE_KEY'), expected_len=64)
ok &= check_key('TESTNET_PRIVATE_KEY', vars.get('TESTNET_PRIVATE_KEY'), expected_len=64)

addr = vars.get('TESTNET_ADDRESS')
if not addr:
    print('TESTNET_ADDRESS: MISSING')
    ok = False
else:
    # basic format
    if addr.startswith('0x'):
        a = addr[2:]
    else:
        a = addr
    if re.match(r'^[0-9a-fA-F]{16}$', a):
        print(f'TESTNET_ADDRESS: OK ({addr})')
    else:
        print(f'TESTNET_ADDRESS: INVALID -> {addr}')
        ok = False

if not ok:
    raise SystemExit(2)

print('All checks passed. If deploy still fails, ensure these keys match the correct accounts and algorithms.')
