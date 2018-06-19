/* exported createCookie */
function createCookie(name, value, days) {
  var expires;
  var date = new Date();
  if (days) {
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toGMTString();
  } else {
    expires = '';
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}

/* exported readCookie */
function readCookie(name) {
  var i;
  var c;
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (i = 0; i < ca.length; i += 1) {
    c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/* exported eraseCookie */
function eraseCookie(name) {
  createCookie(name, '', -1);
}
