/**
 * MVP FLOW BOUTIQUE - Social Auth Service (September 2026 Standard)
 * - Google Identity Services (GIS) + One-Tap + FedCM
 * - Facebook JavaScript SDK v20.0+ (Meta Graph API)
 */

let isGoogleLoading = false;
let isGoogleReady = false;
let isFacebookLoading = false;
let isFacebookReady = false;

/**
 * Decode JWT token payload safely in browser
 */
export const decodeJwtPayload = (jwt) => {
  try {
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding JWT payload:', err);
    return null;
  }
};

/**
 * Dynamically load Google Identity Services (GIS) client
 */
export const loadGoogleGIS = () => {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      isGoogleReady = true;
      return resolve(window.google.accounts.id);
    }
    if (isGoogleLoading) {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          isGoogleReady = true;
          resolve(window.google.accounts.id);
        }
      }, 50);
      return;
    }

    isGoogleLoading = true;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleReady = true;
      isGoogleLoading = false;
      resolve(window.google?.accounts?.id || null);
    };
    script.onerror = () => {
      console.warn('Google Identity Services script failed to load.');
      isGoogleLoading = false;
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

/**
 * Dynamically load Facebook JavaScript SDK (v20.0)
 */
export const loadFacebookSDK = (appId) => {
  return new Promise((resolve) => {
    if (window.FB) {
      isFacebookReady = true;
      return resolve(window.FB);
    }
    if (isFacebookLoading) {
      const interval = setInterval(() => {
        if (window.FB) {
          clearInterval(interval);
          isFacebookReady = true;
          resolve(window.FB);
        }
      }, 50);
      return;
    }

    isFacebookLoading = true;
    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: appId || '1234567890',
          cookie: true,
          xfbml: true,
          version: 'v20.0',
        });
        isFacebookReady = true;
        isFacebookLoading = false;
        resolve(window.FB);
      } else {
        resolve(null);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/es_LA/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      console.warn('Facebook SDK failed to load.');
      isFacebookLoading = false;
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

/**
 * Initialize Google One-Tap Prompt (Native 2026 UI)
 */
export const initGoogleOneTap = async ({ clientId, onCredentialResponse }) => {
  if (!clientId) return;
  try {
    const googleId = await loadGoogleGIS();
    if (!googleId) return;

    googleId.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response && response.credential) {
          const profile = decodeJwtPayload(response.credential);
          onCredentialResponse({
            credential: response.credential,
            profile: profile
              ? {
                  providerId: profile.sub,
                  name: profile.name || profile.given_name,
                  email: profile.email,
                  avatar: profile.picture,
                }
              : null,
          });
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });

    // Display Google One Tap overlay
    googleId.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        // One tap not displayed (e.g. dismissed by user recently or third-party cookies blocked)
      }
    });
  } catch (err) {
    console.warn('Google One Tap init warning:', err);
  }
};

/**
 * Render standard Google Sign-In button into a DOM container
 */
export const renderGoogleSignInButton = async (containerElement, { clientId, onCredentialResponse }) => {
  if (!containerElement || !clientId) return;
  try {
    const googleId = await loadGoogleGIS();
    if (!googleId) return;

    googleId.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response && response.credential) {
          const profile = decodeJwtPayload(response.credential);
          onCredentialResponse({
            credential: response.credential,
            profile: profile
              ? {
                  providerId: profile.sub,
                  name: profile.name || profile.given_name,
                  email: profile.email,
                  avatar: profile.picture,
                }
              : null,
          });
        }
      },
    });

    googleId.renderButton(containerElement, {
      type: 'standard',
      theme: 'filled_blue',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      logo_alignment: 'left',
      width: 320,
    });
  } catch (err) {
    console.warn('Google button render error:', err);
  }
};

/**
 * Trigger Facebook Login Popup via FB.login
 */
export const loginWithFacebookSDK = async (appId) => {
  if (!appId) {
    throw new Error('FACEBOOK_APP_ID no configurado');
  }

  const FB = await loadFacebookSDK(appId);
  if (!FB) {
    throw new Error('No se pudo inicializar Facebook SDK');
  }

  return new Promise((resolve, reject) => {
    FB.login(
      (response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          const userID = response.authResponse.userID;

          // Fetch user details
          FB.api('/me', { fields: 'id,name,email,picture.width(200).height(200)' }, (userRes) => {
            if (userRes && !userRes.error) {
              resolve({
                accessToken,
                userID,
                profile: {
                  providerId: userRes.id,
                  name: userRes.name,
                  email: userRes.email || '',
                  avatar: userRes.picture?.data?.url || '',
                },
              });
            } else {
              resolve({
                accessToken,
                userID,
                profile: {
                  providerId: userID,
                  name: 'Usuario Facebook',
                  email: '',
                  avatar: '',
                },
              });
            }
          });
        } else {
          reject(new Error(response.status === 'unknown' ? 'Inicio de sesión cancelado' : 'Error en Facebook Login'));
        }
      },
      { scope: 'public_profile,email' }
    );
  });
};

/**
 * Dynamically load Sign in with Apple JS SDK (September 2026 Standard)
 */
export const loadAppleSDK = () => {
  return new Promise((resolve) => {
    if (window.AppleID?.auth) {
      return resolve(window.AppleID.auth);
    }
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      resolve(window.AppleID?.auth || null);
    };
    script.onerror = () => {
      console.warn('Sign in with Apple script failed to load.');
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

/**
 * Trigger Sign in with Apple Popup via AppleID.auth.signIn()
 */
export const loginWithAppleSDK = async (clientId) => {
  const AppleAuth = await loadAppleSDK();
  if (!AppleAuth) {
    throw new Error('No se pudo inicializar Apple ID SDK');
  }

  const redirectURI = window.location.origin;

  AppleAuth.init({
    clientId: clientId || 'com.mvpflowboutique.web',
    scope: 'name email',
    redirectURI: redirectURI,
    usePopup: true,
  });

  const response = await AppleAuth.signIn();
  if (!response || !response.authorization) {
    throw new Error('No se recibió autorización de Apple');
  }

  const idToken = response.authorization.id_token;
  const decoded = idToken ? decodeJwtPayload(idToken) : null;

  return {
    idToken,
    code: response.authorization.code,
    user: response.user || null,
    profile: {
      providerId: decoded?.sub || 'apple-user',
      name: response.user?.name ? `${response.user.name.firstName || ''} ${response.user.name.lastName || ''}`.trim() : (decoded?.email ? decoded.email.split('@')[0] : 'Usuario Apple'),
      email: decoded?.email || '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
  };
};

