import { parseText, type Thumbnail, type WP_Image, parseThumbnail } from '~/types/wordpress'

export interface Dictionary {
  copy: {
    [key: string]: string
  }
  thumbnail: {
    [key: string]: Thumbnail
  }
  sn: Array<SocialNetwork>
}

export interface SocialNetwork {
  network: {
    value: 'instagram' | 'tik-tok' | 'youtube' | 'linkedin'
    label: string
  }
  hint: string
  link: string
}

export interface WP_Dictionary {
  acf: {
    video_ask_id: string
    thumbnail: WP_Image
    social_networks: Array<SocialNetwork>
    id: string
    name: string
    job_title: string
    email: string
    phone_number: string
    address_hint: string
    address: string
    contact_cta: string
    contact_cta_question: string
    contact_hint: string
    contact_link: string
    newsletter_hint: string
    newsletter_placeholder: string
    featured_title: string
    featured_hint: string
    videoask_hint: string
    view_all_label: string
    read_all_label: string
    read_more_label: string
    read_less_label: string
    filter_by_label: string
    reviews_label: string
    buy_your_home_label: string
    refinance_label: string
    get_your_quote_label: string
    loan_rate_label: string
    interest_rate_label: string
    apr_label: string
    apr_tooltip_box: string
    points_label: string
    points_tooltip_box: string
    average_interest_rate_label: string
    average_interest_rate_tooltip_box: string
    or: string
    get_your_quote_overlay_title: string
    get_your_quote_overlay_hint: string
    get_your_quote_overlay_continue_label: string
    get_your_quote_overlay_confirm_label: string
    get_your_quote_overlay_deny_label: string
    minutes_read: string
    table_of_contents_label: string
    by_label: string
    related_articles_hint: string
    related_articles_title: string
    newsletter_success_overlay_image: WP_Image
    newsletter_success_overlay_title: string
    newsletter_success_overlay_content: string
    newsletter_success_overlay_bottom_message: string
    newsletter_subscription_overlay_image: WP_Image
    newsletter_subscription_overlay_title: string
    newsletter_subscription_overlay_content: string
    newsletter_subscription_overlay_close_cta: string
    exit_intent_overlay_image: WP_Image
    exit_intent_overlay_title: string
    exit_intent_overlay_subtitle: string
    exit_intent_overlay_content: string
    exit_intent_overlay_button_hint: string
    blog_posts_label: string
    sort_by_label: string
    newer_first_label: string
    older_first_label: string
    load_more_label: string
    available_tags_title: string
    all_label: string
    learn_more_label: string
    share_on_social_label: string
  }
}

export function parseDictionary(data?: WP_Dictionary): Dictionary {
  return {
    copy: {
      videoAskId: parseText(data?.acf.video_ask_id),
      id: parseText(data?.acf.id),
      name: parseText(data?.acf.name),
      jobTitle: parseText(data?.acf.job_title),
      email: parseText(data?.acf.email),
      phoneNumber: parseText(data?.acf.phone_number),
      addressHint: parseText(data?.acf.address_hint),
      address: parseText(data?.acf.address),
      contactCTA: parseText(data?.acf.contact_cta),
      contactCTAQuestion: parseText(data?.acf.contact_cta_question),
      contactHint: parseText(data?.acf.contact_hint),
      contactLink: parseText(data?.acf.contact_link),
      newsletterHint: parseText(data?.acf.newsletter_hint),
      newsletterPlaceholder: parseText(data?.acf.newsletter_placeholder),
      featuredTitle: parseText(data?.acf.featured_title),
      featuredHint: parseText(data?.acf.featured_hint),
      videoAskHint: parseText(data?.acf.videoask_hint),
      viewAll: parseText(data?.acf.view_all_label),
      readAll: parseText(data?.acf.read_all_label),
      readMore: parseText(data?.acf.read_more_label),
      readLess: parseText(data?.acf.read_less_label),
      filterBy: parseText(data?.acf.filter_by_label),
      reviews: parseText(data?.acf.reviews_label),
      buyYourHome: parseText(data?.acf.buy_your_home_label),
      refinance: parseText(data?.acf.refinance_label),
      getYourQuote: parseText(data?.acf.get_your_quote_label),
      loanTerm: parseText(data?.acf.loan_rate_label),
      interestRate: parseText(data?.acf.interest_rate_label),
      apr: parseText(data?.acf.apr_label),
      aprTooltip: parseText(data?.acf.apr_tooltip_box),
      points: parseText(data?.acf.points_label),
      pointsTooltip: parseText(data?.acf.points_tooltip_box),
      averageRateLabel: parseText(data?.acf.average_interest_rate_label),
      averageRateTooltip: parseText(data?.acf.average_interest_rate_tooltip_box),
      or: parseText(data?.acf.or),
      getYourQuoteOverlayTitle: parseText(data?.acf.get_your_quote_overlay_title),
      getYourQuoteOverlayHint: parseText(data?.acf.get_your_quote_overlay_hint),
      getYourQuoteOverlayContinueLabel: parseText(data?.acf.get_your_quote_overlay_continue_label),
      getYourQuoteOverlayConfirmLabel: parseText(data?.acf.get_your_quote_overlay_confirm_label),
      getYourQuoteOverlayDenyLabel: parseText(data?.acf.get_your_quote_overlay_deny_label),
      minRead: parseText(data?.acf.minutes_read),
      tableOfContents: parseText(data?.acf.table_of_contents_label),
      byLabel: parseText(data?.acf.by_label),
      relatedArticlesHint: parseText(data?.acf.related_articles_hint),
      relatedArticlesTitle: parseText(data?.acf.related_articles_title),
      newsletterSuccessOverlayTitle: parseText(data?.acf.newsletter_success_overlay_title),
      newsletterSuccessOverlayContent: parseText(data?.acf.newsletter_success_overlay_content),
      newsletterSuccessOverlayBottomText: parseText(
        data?.acf.newsletter_success_overlay_bottom_message
      ),
      newsletterSubscriptionOverlayTitle: parseText(
        data?.acf.newsletter_subscription_overlay_title
      ),
      newsletterSubscriptionOverlayContent: parseText(
        data?.acf.newsletter_subscription_overlay_content
      ),
      newsletterSubscriptionOverlayCloseCta: parseText(
        data?.acf.newsletter_subscription_overlay_close_cta
      ),
      exitIntentOverlayTitle: parseText(data?.acf.exit_intent_overlay_title),
      exitIntentOverlaySubtitle: parseText(data?.acf.exit_intent_overlay_subtitle),
      exitIntentOverlayContent: parseText(data?.acf.exit_intent_overlay_content),
      exitIntentOverlayButtonHint: parseText(data?.acf.exit_intent_overlay_button_hint),
      blogPosts: parseText(data?.acf.blog_posts_label),
      all: parseText(data?.acf.all_label),
      sortBy: parseText(data?.acf.sort_by_label),
      newerFirst: parseText(data?.acf.newer_first_label),
      olderFirst: parseText(data?.acf.older_first_label),
      loadMore: parseText(data?.acf.load_more_label),
      availableTagsTitle: parseText(data?.acf.available_tags_title),
      learnMore: parseText(data?.acf.learn_more_label),
      shareOnSocial: parseText(data?.acf.share_on_social_label),
    },
    thumbnail: {
      thumbnail: parseThumbnail(data?.acf.thumbnail),
      newsletterSuccessOverlay: parseThumbnail(data?.acf.newsletter_success_overlay_image),
      newsletterSubscriptionOverlay: parseThumbnail(
        data?.acf.newsletter_subscription_overlay_image
      ),
      exitIntentOverlay: parseThumbnail(data?.acf.exit_intent_overlay_image),
    },
    sn: data?.acf.social_networks || [],
  }
}
