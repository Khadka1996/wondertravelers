/** On English pages, drop the cookie so Google's translator stays off. */
export default function ClearTranslateCookie() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function () {
  if (document.cookie.indexOf('googtrans=') === -1) return;
  var expire = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = expire;
  document.cookie = expire + '; domain=.' + location.hostname.replace(/^www\\./, '');
})();`,
      }}
    />
  );
}
