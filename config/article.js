export default () => ({ // eslint-disable-line

  // link file UUID
  id: 'to come',

  // canonical URL of the published page
  // https://ig.ft.com/brexit-treaty-database get filled in by the ./configure script
  url: 'https://ig.ft.com/to come',

  // To set an exact publish date do this:
  //       new Date('2016-05-17T17:11:22Z')
  publishedDate: new Date(),

  headline: 'Top 100 global brands',

  // summary === standfirst (Summary is what the content API calls it)
  summary: 'Add a summary here',

  topic: {
    name: 'Global brands',
    url: 'https://www.ft.com/reports/global-brands',
  },

  relatedArticle: {
    text: '',
    url: '',
  },

  mainImage: {
    title: '',
    description: '',
    credit: '',
    url: 'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fft-ig-images-prod.s3-website-eu-west-1.amazonaws.com%2Fv1%2F8502122625-ssin4.png?source=ig&width=2048&height=1152',
    width: 2048, // ensure correct width
    height: 1152, // ensure correct height
  },

  // Byline can by a plain string, markdown, or array of authors
  // if array of authors, url is optional
  byline: [
    { name: 'Chris Campbell', url: 'https://www.ft.com/chris-campbell' },
  ],

  // Appears in the HTML <title>
  title: 'Global brands',

  // meta data
  description: '',

  /*
  TODO: Select Twitter card type -
        summary or summary_large_image

        Twitter card docs:
        https://dev.twitter.com/cards/markup
  */
  twitterCard: 'summary_large_image cards',

  /*
  TODO: Do you want to tweak any of the
        optional social meta data?
  */
  // General social
  socialImage: 'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fft-ig-images-prod.s3-website-eu-west-1.amazonaws.com%2Fv1%2F8502122625-ssin4.png?source=ig&width=1440',
  socialHeadline: 'to come',
   socialDescription: 'to come',
   twitterCreator: '@ft', // shows up in summary_large_image cards

  // TWEET BUTTON CUSTOM TEXT
  tweetText: 'to come',
  twitterRelatedAccounts: [], // Twitter lists these as suggested accounts to follow after a user tweets (do not include @)

  // Fill out the Facebook/Twitter metadata sections below if you want to
  // override the General social options above

  // TWITTER METADATA (for Twitter cards)
  twitterImage: 'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fft-ig-images-prod.s3-website-eu-west-1.amazonaws.com%2Fv1%2F8502122625-ssin4.png?source=ig&width=1440',
 twitterHeadline: 'to come',
  twitterDescription: 'to come',

  // FACEBOOK
  facebookImage: 'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fft-ig-images-prod.s3-website-eu-west-1.amazonaws.com%2Fv1%2F8502122625-ssin4.png?source=ig&width=1440',
   facebookHeadline: 'to come',
   facebookDescription: 'to come',

  //ADVERTISING
  ads: {
    // ad unit hierarchy makes ads more granular. Start with ft.com and /companies /markets /world as appropriate to your story
    gptAdunit: 'ft.com/special-reports',
    // granular targeting is optional and will be specified by the ads team
    dftTargeting: '',
  },

  tracking: {

    /*

    Microsite Name

    e.g. guffipedia, business-books, baseline.
    Used to query groups of pages, not intended for use with
    one off interactive pages. If you're building a microsite
    consider more custom tracking to allow better analysis.
    Also used for pages that do not have a UUID for whatever reason
    */
    // micrositeName: '',

    /*
    Product name

    This will usually default to IG
    however another value may be needed
    */
    // product: '',
  },
});
