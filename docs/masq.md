# Masq architecture overview
Masq is using hyperdb, see https://github.com/mafintosh/hyperdb/blob/master/ARCHITECTURE.md

## DBs
Masq will create and sync these DBs:

- masq-private
- masq-public
- all app-user databases

As soon as masq is started, the sync will happen for every databases, even the one not owned by the current user.

## Security
[TODO]

### masq-private
- /users -> list of users ids
- /users/:id/profile -> user info, with
- /users/:id/apps -> apps and their corresponding DB key

masq-private db will only be synced among masq instances. It will never be shared with apps.

### masq-public
- /users -> list of users ids
- /users/:id/profile -> user public info (username, profile picture)

### app DB
The app DB can be used freely by the developers.

One DB is created for one unique couple of user-app.

## App Authorization
Thanks to the masq client library, the application will generate a random channel id, and a random challenge, used to verify the peers identities.
The channel id and challenge will then be added as parameters to the masq url, for instance:
`masq.qwant.com/registerapp/secret-channel-id/challenge`

Once the user clicks on the link, masq.qwant.com will parse the url, and join the channel to exchange info with the app, then:

- if a user is already connected, a confirmation popup will appear. (should not be possible for now as a session is temporary)
- if no user is connected, the user will first need to signin before the modal appears.

Once the user authorizes the app, a new db will be created for this specific couple of user-app, and write access will be given.
Masq will then store the DB data in indexeddb under the name `userid-appname` (or its hash).

