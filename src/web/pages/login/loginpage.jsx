/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {connect} from 'react-redux';

import {withRouter} from 'web/utils/withRouter';

import styled from 'styled-components';

import Rejection from 'gmp/http/rejection';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';
import withGmp from 'web/utils/withGmp';

import Img from 'web/components/img/img';

import Layout from 'web/components/layout/layout';

import Footer from 'web/components/structure/footer';

import {
  setSessionTimeout,
  setUsername,
  updateTimezone,
  setIsLoggedIn,
} from 'web/store/usersettings/actions';

import {isLoggedIn} from 'web/store/usersettings/selectors';

import LoginForm from './loginform';

const log = logger.getLogger('web.login');

const StyledLayout = styled(Layout)`
  background: radial-gradient(
    51.84% 102.52% at 58.54% 44.97%,
    #a1ddba 0%,
    ${Theme.green} 67.26%
  );
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const BackgroundTopImage = styled(Img)`
  position: fixed;
  top: 0;
  right: 0;
`;

const BackgroundBottomImage = styled(Img)`
  position: fixed;
  bottom: 0;
  left: 0;
`;

const isIE11 = () =>
  navigator.userAgent.match(/Trident\/([\d.]+)/)
    ? +navigator.userAgent.match(/Trident\/([\d.]+)/)[1] >= 7
    : false;

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGuestLogin = this.handleGuestLogin.bind(this);
  }

  handleSubmit(username, password) {
    this.login(username, password);
  }

  handleGuestLogin() {
    const {gmp} = this.props;
    this.login(gmp.settings.guestUsername, gmp.settings.guestPassword);
  }

  login(username, password) {
    const {gmp} = this.props;

    gmp.login(username, password).then(
      data => {
        const {locale, timezone, sessionTimeout} = data;

        const {location, navigate} = this.props;

        this.props.setTimezone(timezone);
        this.props.setLocale(locale);
        this.props.setSessionTimeout(sessionTimeout);
        this.props.setUsername(username);
        // must be set before changing the location
        this.props.setIsLoggedIn(true);

        if (
          location &&
          location.state &&
          location.state.next &&
          location.state.next !== location.pathname
        ) {
          navigate(location.state.next, {replace: true});
        } else {
          navigate('/dashboards', {replace: true});
        }
      },
      rej => {
        log.error(rej);
        this.setState({error: rej});
      },
    );
  }

  componentDidMount() {
    const {navigate, isLoggedIn = false} = this.props; // eslint-disable-line no-shadow

    // redirect user to main page if he is already logged in
    if (isLoggedIn) {
      navigate('/dashboards', {replace: true});
    }
  }

  render() {
    const {error} = this.state;
    const {gmp} = this.props;

    let message;

    if (error) {
      if (error.reason === Rejection.REASON_UNAUTHORIZED) {
        message = _('Login Failed. Invalid password or username.');
      } else if (isEmpty(error.message)) {
        message = _('Unknown error on login.');
      } else {
        message = error.message;
      }
    }

    const showGuestLogin =
      isDefined(gmp.settings.guestUsername) &&
      isDefined(gmp.settings.guestPassword);

    const showLogin = !gmp.settings.disableLoginForm;
    const showProtocolInsecure = window.location.protocol !== 'https:';

    return (
      <StyledLayout>
        <BackgroundTopImage src="login-top.svg" />
        <BackgroundBottomImage src="login-bottom.svg" />
        <LoginForm
          error={message}
          showGuestLogin={showGuestLogin}
          showLogin={showLogin}
          showProtocolInsecure={showProtocolInsecure}
          isIE11={isIE11()}
          onGuestLoginClick={this.handleGuestLogin}
          onSubmit={this.handleSubmit}
        />
        <Footer />
      </StyledLayout>
    );
  }
}

LoginPage.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  navigate: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
  location: PropTypes.object.isRequired,
  setIsLoggedIn: PropTypes.func.isRequired,
  setLocale: PropTypes.func.isRequired,
  setSessionTimeout: PropTypes.func.isRequired,
  setTimezone: PropTypes.func.isRequired,
  setUsername: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  setTimezone: timezone => dispatch(updateTimezone(gmp)(timezone)),
  setLocale: locale => gmp.setLocale(locale),
  setSessionTimeout: timeout => dispatch(setSessionTimeout(timeout)),
  setUsername: username => dispatch(setUsername(username)),
  setIsLoggedIn: value => dispatch(setIsLoggedIn(value)),
});

const mapStateToProp = (rootState, ownProps) => ({
  isLoggedIn: isLoggedIn(rootState),
});

export default compose(
  withRouter,
  withGmp,
  connect(mapStateToProp, mapDispatchToProps),
)(LoginPage);

// vim: set ts=2 sw=2 tw=80:
