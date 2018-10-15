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
The app db can be used freely by the developers.

One app DB is created for each user.

## App Authorization
Thanks to the masq client library, the application will generate a random channel id, and a random challenge, used to verify the peer identity.
The channel id and challenge will then be added as parameters to the masq url, for instance:
`masq.qwant.com/registerapp/secret-channel-id/challenge`

Once the user clicks on the link, masq.qwant.com will parse the url, and join the channel to exchange info with the app, then:

- if a user is already connected, a confirmation popup will appear. (should not be possible for now as a session is temporary)
- if no user is connected, the user will first need to signin before the modal appears.

Once the user authorize the app, a new db will be created for this specific couple of user-app, and write access will be given.
