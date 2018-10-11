# Masq architecture overview
Masq is based on hyperdb, see https://github.com/mafintosh/hyperdb/blob/master/ARCHITECTURE.md

## DBs
Masq will create and sync these DBs:

- masq-private
- masq-public
- all apps databases

### masq-private
- /users -> list of users ids
- /users/:id
- /users/:id/profile -> user info
- /users/:id/apps -> list of apps ids
- /users/:id/apps/:id -> app info (name, db key...)

### masq-public
- /users -> list of users ids
- /users/:id
- /users/:id/profile -> user public info

### app DB
The app db can be used freely by the developers
