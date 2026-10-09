import Script from 'next/script';

/**
 * Free Google website translator, loaded on /ne pages only. It turns English
 * left on the page (content staff wrote in English) into Nepali; text that is
 * already Nepali (from ne.json) is left alone.
 */
export default function GoogleTranslate() {
  return (
    <>
      <div id="google_translate_element" hidden />
      {/* Runs before hydration: the cookie tells Google what to translate, and the
          DOM guard stops React crashing when Google has replaced text nodes. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
        (function () {
          var value = '/en/ne';
          document.cookie = 'googtrans=' + value + '; path=/';
          var host = location.hostname.replace(/^www\\./, '');
          document.cookie = 'googtrans=' + value + '; path=/; domain=.' + host;
          if (window.__gtGuard) return;
          window.__gtGuard = true;
          var removeChild = Node.prototype.removeChild;
          Node.prototype.removeChild = function (child) {
            if (child.parentNode !== this) return child;
            return removeChild.apply(this, arguments);
          };
          var insertBefore = Node.prototype.insertBefore;
          Node.prototype.insertBefore = function (node, ref) {
            if (ref && ref.parentNode !== this) return node;
            return insertBefore.apply(this, arguments);
          };
          window.googleTranslateElementInit = function () {
            new google.translate.TranslateElement(
              { pageLanguage: 'en', includedLanguages: 'ne', autoDisplay: false },
              'google_translate_element'
            );
          };
        })();
      `,
        }}
      />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
