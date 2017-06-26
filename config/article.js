export default () => ({ // eslint-disable-line

  // link file UUID
  id: '4b1a73d4-5a5f-11e7-b553-e2df1b0c3220',

  // canonical URL of the published page
  // https://ig.ft.com/brexit-treaty-database get filled in by the ./configure script
  url: 'https://ig.ft.com/top-100-global-brands',

  // To set an exact publish date do this:
  //       new Date('2016-05-17T17:11:22Z')
  publishedDate: new Date(),

  headline: 'Top 100 global brands, 2017',

  // summary === standfirst (Summary is what the content API calls it)
  summary: 'The BrandZ ranking of the world’s 100 most valuable stocks, compiled by Kantar Millward Brown, part of the WPP advertising group',

  topic: {
    name: 'Global brands',
    url: 'www.ft.com/reports/global-brands',
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
    { name: 'Scheherazade Daneshkhu', url: 'https://www.ft.com/stream/d69cf22f-ac26-344a-9141-2d80728be9a0'},
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
  socialHeadline: 'The most valuable global brands',
   socialDescription: 'Technology companies dominate the table, while car makers and banks decline',
   twitterCreator: '@ft', // shows up in summary_large_image cards

  // TWEET BUTTON CUSTOM TEXT
  tweetText: 'The most valuable global brands',
  twitterRelatedAccounts: [], // Twitter lists these as suggested accounts to follow after a user tweets (do not include @)

  // Fill out the Facebook/Twitter metadata sections below if you want to
  // override the General social options above

  // TWITTER METADATA (for Twitter cards)
  twitterImage: 'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fft-ig-images-prod.s3-website-eu-west-1.amazonaws.com%2Fv1%2F8502122625-ssin4.png?source=ig&width=1440',
 twitterHeadline: 'The most valuable global brands',
  twitterDescription: 'Technology companies dominate the table, while car makers and banks decline',

  // FACEBOOK
  facebookImage: 'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fft-ig-images-prod.s3-website-eu-west-1.amazonaws.com%2Fv1%2F8502122625-ssin4.png?source=ig&width=1440',
   facebookHeadline: 'The most valuable global brands',
   facebookDescription: 'Technology companies dominate the table, while car makers and banks decline',

  //ADVERTISING
  ads: {
    // ad unit hierarchy makes ads more granular. Start with ft.com and /companies /markets /world as appropriate to your story
    gptAdunit: 'ft.com/reports',
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
