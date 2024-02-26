import axios from 'axios';
import jwt_decode from 'jwt-decode';

import router, { ROUTES } from './../router/index';
import store from './../store/index';

export const CONFIG = {
  USER_COOKIE: 'u5r',
  BEFORE_LOGIN_ROUTE: 'rt',
  JWT_BE_COOKIE: 'ela-jwt',
  JWT_EXPIRY_CHECK: 'expck'
};

const STATUSES = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  GONE: 410,
  UNAVAILABLE: 503
};

function hasAccess(allowedRoles, currentRoles) {
  if (allowedRoles) {
    if (allowedRoles.includes('any')) return true;
    return allowedRoles.some(role => role === currentRoles);
  }
  return true;
}

function resetUser() {
  let userRoles = store.state.user.role;
  if (userRoles.length > 0) {
    setAxiosAuthToken(store.state.user.token);
    setAutoLogout();

    return userRoles;
  }

  const cookie = window.$cookies.isKey(CONFIG.USER_COOKIE)
    ? window.$cookies.get(CONFIG.USER_COOKIE)
    : {};
  if (cookie.role) {
    const { role } = cookie;
    const { token } = cookie;
    setAxiosAuthToken(token);
    store.dispatch('user/storeUser', cookie);
    setAutoLogout();

    return role;
  }

  if (window.$cookies.isKey(CONFIG.JWT_BE_COOKIE)) {
    const userJWT = window.$cookies.get(CONFIG.JWT_BE_COOKIE);
    window.$cookies.remove(
      CONFIG.JWT_BE_COOKIE,
      null,
      process.env.VUE_APP_JWT_DOMAIN
    );

    parseToken(userJWT);

    const payload = jwt_decode(userJWT);
    const { userData } = payload;

    setAutoLogout();

    return userData.role;
  }
  return [];
}

function authRouteGuard(to, from, next) {
  const r_key = Object.keys(ROUTES).find(
    key =>
      to.matched[0].path === ROUTES[key].path || to.path == ROUTES[key].path
  );
  const destination = ROUTES[r_key];

  // if destination does not require auth navigate
  if (!destination.authorized) {
    return next();
  }

  const userRoles = resetUser();

  if (window.$cookies.isKey(CONFIG.BEFORE_LOGIN_ROUTE)) {
    return handlePreLoginRouteAccess(
      next,
      process.env.VUE_APP_JWT_DOMAIN,
      userRoles
    );
  }

  if (userRoles.length > 0) {
    return hasAccess(destination.roles, userRoles)
      ? next()
      : next(ROUTES.ACCESS_REQUEST.path);
  }

  // finally - user not logged in
  // if intended other than '/' store it in cookie
  if (to.path !== '/' && to.path !== '/logout') {
    window.$cookies.set(
      CONFIG.BEFORE_LOGIN_ROUTE,
      to.path,
      '1h',
      null,
      process.env.VUE_APP_JWT_DOMAIN
    );
  }
  return (window.location.href = `${process.env.VUE_APP_AUTH_BASE_URL}/login`);
}

function expCheck() {
  const almostExpired = !window.$cookies.isKey(CONFIG.JWT_EXPIRY_CHECK);
  const expired = !window.$cookies.isKey(CONFIG.USER_COOKIE);
  if (expired) {
    clearInterval(store.state.user.sessionExpInterval);
    store.dispatch('user/clearLogoutInterval');
    store.dispatch('user/setSessionExpInt', null);
    return logout('session expired');
  }
  if (almostExpired) {
    return store.dispatch('user/warn', true);
  }
}

function extendSession() {
  store.dispatch('user/setLoading', true);
  store.dispatch('user/warn', false);
  axios.get(`${process.env.VUE_APP_AUTH_BASE_URL}/renew`).then(r => {
    parseToken(r.data.updatedToken);
    store.dispatch('user/setLoading', false);
  });
}

// eslint-disable-next-line no-unused-vars
function handlePreLoginRouteAccess(next, hostname, roles) {
  const beforeLoginIntended = window.$cookies.get(CONFIG.BEFORE_LOGIN_ROUTE);

  window.$cookies.remove(CONFIG.BEFORE_LOGIN_ROUTE, null, hostname);

  let r_key = Object.keys(ROUTES).find(
    key => beforeLoginIntended === ROUTES[key].path
  );
  // if could not find route check if it is due to direct access to request
  // fails due to variable ID does not match any route
  if (!r_key) {
    if (!beforeLoginIntended.includes('/request/')) {
      // if not go to not found
      next('/notFound');
    } else {
      r_key = 'REQUEST';
    }
  }
  // eslint-disable-next-line no-unused-vars
  const intendedRoute = ROUTES[r_key];

  return hasAccess(intendedRoute.roles, roles)
    ? next(beforeLoginIntended)
    : next(ROUTES.ACCESS_REQUEST.path);
}

function logout(message) {
  console.warn('logged out due to', message);
  window.$cookies.remove(
    CONFIG.USER_COOKIE,
    null,
    process.env.VUE_APP_JWT_DOMAIN
  );
  if (
    !(
      axios.defaults.headers.common['Authorization'] == null ||
      axios.defaults.headers.common.Authorization == ''
    )
  )
    store.dispatch('user/logout');
  axios.defaults.headers.common['Authorization'] = null;
  store.dispatch('user/warn', false);
  if (message === 'apiDown') {
    router.push(ROUTES.APIDOWN.path);
  } else {
    router.push('/logout');
  }
}

function parseToken(userJWT) {
  const payload = jwt_decode(userJWT);
  const { userData, exp } = payload;
  const expDate = new Date(exp * 1000);
  const now = new Date();
  const expS = Math.floor((expDate.getTime() - now.getTime()) / 1000);

  userData.token = userJWT;
  // expiration (in seconds) is set to JWT expiration minus 15 minutes
  const expTokenS = Math.floor(
    (expDate.getTime() - now.getTime() - 900000) / 1000
  );

  window.$cookies.set(
    CONFIG.JWT_EXPIRY_CHECK,
    'i like to boogy',
    `${expTokenS}s`,
    null,
    process.env.VUE_APP_JWT_DOMAIN
  );

  setAutoLogout();

  store.dispatch('user/storeUser', userData);
  window.$cookies.set(
    CONFIG.USER_COOKIE,
    userData,
    `${expS}s`,
    null,
    process.env.VUE_APP_JWT_DOMAIN
  );

  // set default bearer
  setAxiosAuthToken(userJWT);
}

function setAuthNoTokenPreventer() {
  axios.interceptors.request.use(
    config => {
      if (
        config.url.includes('/owner/get/approving') ||
        config.url.includes('/owner/approve')
      ) {
        return config;
      }
      if (
        config.headers.common['Authorization'] == null ||
        config.headers.common.Authorization == ''
      ) {
        if (store.state.user.token.length > 0) {
          setAxiosAuthToken(store.state.user.token);
          config.headers.common[
            'Authorization'
          ] = `Bearer ${store.state.user.token}`;
          // eslint-disable-next-line no-console
          console.debug('token set from store');
          return config;
        } else if (window.$cookies.isKey(CONFIG.USER_COOKIE)) {
          setAxiosAuthToken(window.$cookies.get(CONFIG.USER_COOKIE).token);
          config.headers.common['Authorization'] = `Bearer ${
            window.$cookies.get(CONFIG.USER_COOKIE).token
          }`;
          // eslint-disable-next-line no-console
          console.debug('token set from cookie');
          return config;
        }
        logout('axios has no token - preventing call to API');
        return Promise.reject(new Error('no token -> logout'));
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
}

function setAutoLogout() {
  const sessionExpInterval = setInterval(() => {
    expCheck();
  }, 180000);
  store.dispatch('user/setSessionExpInt', sessionExpInterval);
}

function setAxiosAuthToken(token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function setGlobalAuthErrorHandler() {
  axios.interceptors.response.use(
    r => {
      if (r.data.notification?.title) sendNotification(r.data.notification);
      if (r.data.data) return Promise.resolve(r.data.data);
      return Promise.resolve(r);
    },
    err => {
      if (!err.response) {
        return Promise.reject(err);
      }

      if (err.response.data.notification?.title) {
        sendNotification(err.response.data.notification);
      }

      if (err.response.status) {
        switch (err.response.status) {
          case STATUSES.UNAUTHORIZED:
            router.push('/forbidden');
            break;
          case STATUSES.NOT_FOUND:
            router.push('/404');
            break;
          case STATUSES.UNAVAILABLE:
            store.dispatch('user/setAPIflag', true);
            break;
          case STATUSES.GONE:
            store.dispatch('user/setAPIflag', false);
            logout('apiDown');
            break;
          default:
            store.dispatch('user/setAPIflag', false);
        }
      }
      return Promise.reject(err);
    }
  );
}

function sendNotification(notification) {
  if (notification.title) {
    store.dispatch(
      'notifications/createNotification',
      {
        title: notification.title,
        subtitle: notification.subtitle,
        caption: notification.caption,
        severity: notification.severity
      },
      { root: true }
    );
  }
}

export const auth_service = {
  authRouteGuard,
  extendSession,
  logout,
  setAuthNoTokenPreventer,
  setAutoLogout,
  setGlobalAuthErrorHandler,
  resetUser
};
