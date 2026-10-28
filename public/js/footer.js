export function renderFooter(navData) {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'footer__grid';

  // Left Tagline
  const tagline = document.createElement('div');
  tagline.className = 'footer__tagline';
  tagline.innerHTML = 'AI-NATIVE<br>CREATIVE SUITE';
  grid.appendChild(tagline);

  // 5 Columns matching design
  const columnsData = [
    // Column 1: Create
    [
      {
        title: 'Create',
        links: [
          { label: 'AI Video', href: 'videoGenerator.html' },
          { label: 'AI Image', href: 'imageGenerator.html' },
          { label: 'Edit Image', href: 'imageGenerator.html#edit' },
          { label: 'Inpaint', href: 'imageGenerator.html#inpaint' },
          { label: 'Upscale', href: 'imageGenerator.html#upscale' },
          { label: 'Sora 2 Upscale', href: 'videoGenerator.html?model=Sora%202#upscale' },
          { label: 'Mixed Media', href: 'imageGenerator.html#mixed-media' },
          { label: 'AI Face Swap', href: 'imageGenerator.html#face-swap' },
          { label: 'AI Influencer', href: 'https://app.photonstudio.ai/influencer' },
          { label: 'Apps', href: 'https://app.photonstudio.ai/apps' }
        ]
      }
    ],

    // Column 2: Video Models & Image Models
    [
      {
        title: 'Video Models',
        links: [
          { label: 'Seedance 2.5', href: 'videoGenerator.html?model=Seedance%202.5' },
          { label: 'Seedance 2.0', href: 'videoGenerator.html?model=Seedance%202.0' },
          { label: 'Kling 3.0', href: 'videoGenerator.html?model=Kling%203.0' },
          { label: 'Sora 2 Introduction', href: 'videoGenerator.html?model=Sora%202' },
          { label: 'Veo 3.1 Introduction', href: 'videoGenerator.html?model=Veo%203.1' },
          { label: 'WAN 2.6', href: 'videoGenerator.html?model=Wan%202.6' },
          { label: 'Grok Imagine 1.5', href: 'videoGenerator.html?model=Grok%20Imagine%201.5' },
          { label: 'Gemini Omni Flash', href: 'videoGenerator.html?model=Gemini%20Omni%20Flash' }
        ]
      },
      {
        title: 'Image Models',
        links: [
          { label: 'Nano Banana', href: 'imageGenerator.html?model=Nano%20Banana' },
          { label: 'Flux 2', href: 'imageGenerator.html?model=Flux%202' },
          { label: 'Seedream 5', href: 'imageGenerator.html?model=Seedream%205' },
          { label: 'GPT Image 2', href: 'imageGenerator.html?model=GPT%20Image%202' },
          { label: 'Ideogram 4.5', href: 'imageGenerator.html?model=Ideogram%204.5' }
        ]
      }
    ],

    // Column 3: Studios & Soul
    [
      {
        title: 'Studios',
        links: [
          { label: 'Cinema Studio', href: 'https://app.photonstudio.ai/cinemaFactory' },
          { label: 'Marketing Studio', href: 'https://app.photonstudio.ai/adsFactory' },
          { label: 'Lipsync Studio', href: 'videoGenerator.html#lipsync' },
          { label: 'Higgsfield Popcorn', href: 'https://app.photonstudio.ai/popcorn' },
          { label: 'Higgsfield Canvas', href: 'https://app.photonstudio.ai/canvasGenerator' }
        ]
      },
      {
        title: 'Soul',
        links: [
          { label: 'Soul 2.0', href: 'https://app.photonstudio.ai/soul' },
          { label: 'Soul ID Character', href: 'https://app.photonstudio.ai/soul-character' },
          { label: 'Soul Cinema', href: 'https://app.photonstudio.ai/soul-cinema' }
        ]
      }
    ],

    // Column 4: Platform & Resources
    [
      {
        title: 'Platform',
        links: [
          { label: 'Supercomputer', href: '#supercomputer' },
          { label: 'AI Motion Designer', href: '#ai-motion-designer' },
          { label: 'MCP/CLI', href: '#mcp-cli' },
          { label: 'API', href: '#api' },
          { label: 'Collab', href: '#collab' },
          { label: 'Games', href: '#games' },
          { label: 'Reference Extension', href: '#reference-extension' }
        ]
      },
      {
        title: 'Resources',
        links: [
          { label: 'Blog', href: 'blog/index.html' },
          { label: 'Help Center', href: '#help-center' },
          { label: 'Academy', href: '#academy' },
          { label: 'Prompt Guide', href: '#prompt-guide' }
        ]
      }
    ],

    // Column 5: Company & Community
    [
      {
        title: 'Company',
        links: [
          { label: 'About', href: '#about' },
          { label: 'Trust', href: '#trust' },
          { label: 'Report a vulnerability', href: '#vulnerability' },
          { label: 'Enterprise', href: '#enterprise' },
          { label: 'Team', href: '#team' },
          { label: 'Pricing', href: 'pricing.html' },
          { label: 'Careers', href: '#careers' },
          { label: 'Contact', href: 'mailto:support@photonstudio.ai' }
        ]
      },
      {
        title: 'Community',
        links: [
          { label: 'Community', href: '#community' },
          { label: 'Contests', href: '#contests' },
          { label: 'Creative Partners', href: '#creative-partners' }
        ]
      }
    ]
  ];

  columnsData.forEach(sections => {
    grid.appendChild(createFooterColumnGroup(sections));
  });

  footer.appendChild(grid);

  // Bottom bar
  const bottom = document.createElement('div');
  bottom.className = 'footer__bottom';

  const bottomLinks = document.createElement('div');
  bottomLinks.className = 'footer__bottom-links';

  [
    { text: 'Privacy Policy', href: 'privacy-policy.html' },
    { text: 'Terms & Conditions', href: 'terms-conditions.html' },
    { text: 'Cookie Notice', href: '#' }
  ].forEach(item => {
    const a = document.createElement('a');
    a.className = 'footer__bottom-link';
    a.href = item.href;
    a.textContent = item.text;
    bottomLinks.appendChild(a);
  });

  const socials = document.createElement('div');
  socials.className = 'footer__socials';

  [
    { label: 'X (Twitter)', iconSrc: 'https://img.icons8.com/ios-filled/50/twitterx--v1.png', href: 'https://x.com/photonstudioai' },
    { label: 'Instagram', iconSrc: 'https://img.icons8.com/ios-filled/50/instagram-new--v1.png', href: 'https://www.instagram.com/photonstudio.ai' },
    { label: 'YouTube', iconSrc: 'https://img.icons8.com/ios-filled/50/youtube-play.png', href: 'https://www.youtube.com/@photonstudio-ai' }
  ].forEach(s => {
    const a = document.createElement('a');
    a.className = 'footer__social-icon';
    a.href = s.href;
    a.title = s.label;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    const img = document.createElement('img');
    img.src = s.iconSrc;
    img.alt = s.label;
    img.style.width = '24px';
    img.style.height = '24px';
    img.style.objectFit = 'contain';
    a.appendChild(img);
    socials.appendChild(a);
  });

  bottom.appendChild(bottomLinks);
  bottom.appendChild(socials);
  footer.appendChild(bottom);
}

function createFooterColumnGroup(sections) {
  const col = document.createElement('div');
  col.className = 'footer__column';

  sections.forEach(sec => {
    const secDiv = document.createElement('div');
    secDiv.className = 'footer__column-section';

    const heading = document.createElement('div');
    heading.className = 'footer__column-title';
    heading.textContent = sec.title;
    secDiv.appendChild(heading);

    sec.links.forEach(link => {
      const a = document.createElement('a');
      a.className = 'footer__column-link';
      a.href = link.href;
      a.textContent = link.label;
      secDiv.appendChild(a);
    });

    col.appendChild(secDiv);
  });

  return col;
}
