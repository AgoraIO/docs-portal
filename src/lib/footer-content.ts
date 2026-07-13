type FooterLink = {
  href: string;
  label: string;
};

export type DocsFooterContent = {
  ariaLabel: string;
  certification?: {
    label: string;
    title: string;
  };
  contact: {
    address: readonly string[];
    phone: string;
    title: string;
  };
  copyright: string;
  legalLinks: readonly FooterLink[];
  logoAlt: string;
  navGroups: readonly {
    links: readonly FooterLink[];
    title: string;
  }[];
  rights: string;
  regulatoryLinks?: readonly FooterLink[];
  socialLinks: readonly FooterLink[];
};

const enDocsFooterContent = {
  ariaLabel: 'Agora footer',
  contact: {
    address: ['2804 Mission College Blvd.', 'Santa Clara, CA, USA 95054'],
    phone: '+1 (408) 879-5885',
    title: 'Contact Us',
  },
  copyright: 'Copyright © 2026 Agora',
  legalLinks: [
    {
      href: 'https://www.agora.io/en/privacy-policy/',
      label: 'Privacy Policy',
    },
    {
      href: 'https://www.agora.io/en/terms-of-service/',
      label: 'Cookie Policy',
    },
    {
      href: 'https://www.agora.io/en/terms-of-service/',
      label: 'Terms of Service',
    },
    {
      href: 'https://www.agora.io/en/acceptable-use-policy/',
      label: 'Acceptable Use Policy',
    },
    {
      href: 'https://www.agora.io/en/sitemap/',
      label: 'Site Map',
    },
    {
      href: 'https://www.agora.io/en/trust-safety-with-agora/',
      label: 'Report Abuse of our Terms of Service',
    },
    {
      href: '#',
      label: 'Manage My Cookies',
    },
  ],
  logoAlt: 'Agora',
  navGroups: [
    {
      links: [
        {
          href: 'https://www.agora.io/en/the-agora-platform-advantage/',
          label: 'Agora Advantage',
        },
        {
          href: 'https://www.agora.io/en/products/',
          label: 'Products',
        },
        {
          href: 'https://www.agora.io/en/solutions',
          label: 'Solutions',
        },
        {
          href: 'https://www.agora.io/en/partner-gallery/',
          label: 'Partners',
        },
        {
          href: 'https://www.agora.io/en/success-stories/',
          label: 'Success Stories',
        },
      ],
      title: 'Why Agora',
    },
    {
      links: [
        {
          href: 'https://www.agora.io/en/about-us/',
          label: 'About Us',
        },
        {
          href: 'https://medium.com/agora-io',
          label: 'Blog',
        },
        {
          href: 'https://www.agora.io/en/compliance/',
          label: 'Compliance & Privacy',
        },
        {
          href: 'https://www.agora.io/en/agora-management/',
          label: 'Management',
        },
        {
          href: 'https://www.agora.io/en/events/',
          label: 'Events',
        },
        {
          href: 'https://www.agora.io/en/careers/',
          label: 'Careers',
        },
        {
          href: 'https://www.agora.io/en/newsroom/',
          label: 'Newsroom',
        },
        {
          href: 'https://investor.agora.io/',
          label: 'Investor Relations',
        },
      ],
      title: 'Company',
    },
    {
      links: [
        {
          href: 'https://console.agora.io/',
          label: 'Login',
        },
        {
          href: 'https://www.agora.io/en/pricing/',
          label: 'Pricing',
        },
        {
          href: 'https://www.agora.io/en/support-plans/',
          label: 'Support Plans',
        },
        {
          href: 'https://sso.agora.io/en/signup',
          label: 'Get Started',
        },
        {
          href: '/en/',
          label: 'Documentation',
        },
        {
          href: 'https://www.agora.io/en/talk-to-us/',
          label: 'Talk to Us',
        },
      ],
      title: 'Get Started',
    },
  ],
  rights: 'All rights reserved',
  socialLinks: [
    {
      href: 'https://www.linkedin.com/company/agora-lab-inc/',
      label: 'LinkedIn',
    },
    {
      href: 'https://x.com/AgoraIO',
      label: 'X',
    },
    {
      href: 'https://www.youtube.com/channel/UCjPZukasIgWoB4HBHga5CGA',
      label: 'YouTube',
    },
    {
      href: 'https://github.com/AgoraIO-Community',
      label: 'GitHub',
    },
    {
      href: 'https://discord.gg/QfgBCvuX4d',
      label: 'Discord',
    },
  ],
} as const satisfies DocsFooterContent;

const zhCnDocsFooterContent = {
  ariaLabel: '声网页脚',
  contact: {
    address: ['上海声网科技有限公司'],
    phone: '400 632 6626',
    title: '咨询电话',
  },
  copyright: 'Copyright © 2026 声网',
  legalLinks: [
    {
      href: 'https://www.shengwang.cn/privacy-policy/',
      label: '隐私政策',
    },
    {
      href: 'https://www.shengwang.cn/terms-of-service/',
      label: '服务条款',
    },
    {
      href: 'https://www.shengwang.cn/acceptable-use-policy/',
      label: '可接受的使用政策',
    },
    {
      href: 'https://www.shengwang.cn/compliance/',
      label: '安全合规',
    },
  ],
  certification: {
    label: '962110',
    title: '网络社会征信网认证',
  },
  logoAlt: '声网',
  navGroups: [
    {
      links: [
        {
          href: 'https://www.shengwang.cn/solution/',
          label: '解决方案',
        },
        {
          href: 'https://www.shengwang.cn/usecase/',
          label: '客户案例',
        },
        {
          href: 'https://doc.shengwang.cn/',
          label: '文档中心',
        },
      ],
      title: '产品与方案',
    },
    {
      links: [
        {
          href: 'https://www.shengwang.cn/',
          label: '声网官网',
        },
        {
          href: 'https://www.shengwang.cn/news/',
          label: '新闻中心',
        },
        {
          href: 'https://www.shengwang.cn/compliance/',
          label: '安全合规',
        },
        {
          href: 'https://app.mokahr.com/apply/agora/6334#/',
          label: '加入我们',
        },
      ],
      title: '了解声网',
    },
    {
      links: [
        {
          href: 'https://console.shengwang.cn/',
          label: '控制台',
        },
        {
          href: '/zh-CN/',
          label: '文档中心',
        },
        {
          href: 'https://www.shengwang.cn/contact-sales/',
          label: '联系我们',
        },
      ],
      title: '开始使用',
    },
  ],
  regulatoryLinks: [
    {
      href: 'https://beian.mps.gov.cn/#/query/webSearch?code=31011002006829',
      label: '沪公网安备31011002006829号',
    },
    {
      href: 'https://beian.miit.gov.cn/',
      label: '沪ICP备2024090791号-1',
    },
    {
      href: 'https://www.shengwang.cn/',
      label: '上海声网科技有限公司',
    },
  ],
  rights: '保留所有权利',
  socialLinks: [
    {
      href: 'https://twitter.com/AgoraIO',
      label: 'Twitter',
    },
    {
      href: 'https://www.linkedin.com/company/agora-lab-inc/',
      label: 'LinkedIn',
    },
    {
      href: 'https://www.facebook.com/AgoraIO',
      label: 'Facebook',
    },
    {
      href: 'https://agoraio.slack.com/',
      label: 'Slack',
    },
    {
      href: 'https://www.youtube.com/channel/UCjPZukasIgWoB4HBHga5CGA',
      label: 'YouTube',
    },
    {
      href: 'https://medium.com/agora-io',
      label: 'Medium',
    },
  ],
} as const satisfies DocsFooterContent;

export function getDocsFooterContent(locale: string): DocsFooterContent {
  return locale === 'zh-CN' ? zhCnDocsFooterContent : enDocsFooterContent;
}
