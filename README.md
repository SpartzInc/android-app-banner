Spartz Android App Banner
===================

The Spartz Android App Banner is a fork of the popular [jQuery Smart Banner repository][1]. It
removes support for iOS and Windows (in favor of Apple's default smart app banner). It also adds
an additional callback for when the App banner is created (used to adjust other fixed elements
according to the position of the app banner). Finally, this is available to be included by Bower.

## Usage ##
    <html>
      <head>
        <title>YouTube</title>
        <meta name="author" content="Google, Inc.">
        <meta name="apple-itunes-app" content="app-id=544007664">
        <meta name="google-play-app" content="app-id=com.google.android.youtube">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" href="jquery.smartbanner.css" type="text/css" media="screen">
        <link rel="apple-touch-icon" href="apple-touch-icon.png">
      </head>
      <body>
        ...
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
        <script src="jquery.smartbanner.js"></script>
        <script type="text/javascript">
          $(function() { $.smartbanner() } )
        </script>
      </body>
    </html>

## Options ##
    // override these globally if you like (they are all optional)
    $.smartbanner.defaults = {
      title: null, // What the title of the app should be in the banner (defaults to <title>)
      author: null, // What the author of the app should be in the banner (defaults to <meta name="author"> or hostname)
      price: 'FREE', // Price of the app
      inGooglePlay: 'In Google Play', // Text of price for Android
      googlePlayParams: null, // Aditional parameters for the market
      icon: null, // The URL of the icon (defaults to <meta name="apple-touch-icon">)
      button: 'VIEW', // Text for the install button
      url: null, // The URL for the button. Keep null if you want the button to link to the app store.
      scale: 'auto', // Scale based on viewport size (set to 1 to disable)
      animate: true, // Whether the showing / hiding of the app banner should be animated.
      speedIn: 300, // Show animation speed of the banner
      speedOut: 400, // Close animation speed of the banner
      daysHidden: 15, // Duration to hide the banner after being closed (0 = always show banner)
      daysReminder: 90, // Duration to hide the banner after "VIEW" is clicked *separate from when the close button is clicked* (0 = always show banner)
      hideOnInstall: true, // Hide the banner after "VIEW" is clicked.
      layer: false, // Display as overlay layer or slide down the page
      appendToSelector: 'body', //Append the banner to a specific selector
      pushSelector: 'html', // What element is going to push the site content down; this is where the banner append animation will start.
      onInstall: function() {
        // alert('Click install');
      },
      onClose: function() {
        // alert('Click close');
      },
      onCreate: function() {
        // alert('Banner created');
      }
    };
