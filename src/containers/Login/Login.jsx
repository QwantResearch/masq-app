import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signup, fetchUsers } from '../../actions'

import styles from './Login.module.scss'
import { ReactComponent as Logo } from '../../assets/logo.svg'
import { ReactComponent as Background } from '../../assets/background.svg'
import { ReactComponent as PlusSquare } from '../../assets/plus-square.svg'
import { Avatar } from '../../components'

import { Signup } from '../../modals'

class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isSignupModalOpened: false
    }

    this.handleSignup = this.handleSignup.bind(this)
    this.handleClickNewUser = this.handleClickNewUser.bind(this)
  }

  componentDidMount () {
    this.props.fetchUsers()
  }

  handleClickNewUser () {
    this.setState({
      isSignupModalOpened: !this.state.isSignupModalOpened
    })
  }

  handleSignup (user) {
    const { signup } = this.props
    signup(user)
    this.setState({ isSignupModalOpened: false })
  }

  render () {
    const { users } = this.props
    console.log('users', users)
    const { isSignupModalOpened } = this.state
    return (
      <div className={styles.App}>
        <Logo className={styles.Logo} />
        <h1 className={styles.title}>Qui est-ce ?</h1>
        <div className={styles.users}>
          {users.map(user => <Avatar key={user.username} {...user} />)}
          <PlusSquare className={styles.PlusSquare} onClick={this.handleClickNewUser} />
        </div>
        <Background className={styles.Background} />
        {isSignupModalOpened && <Signup onSignup={this.handleSignup} />}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.masq.user,
  users: state.masq.users
})

const mapDispatchToProps = dispatch => ({
  signup: user => dispatch(signup(user)),
  fetchUsers: user => dispatch(fetchUsers(user))
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
