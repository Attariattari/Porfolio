import json, urllib.request, urllib.error
from html.parser import HTMLParser

class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ''
        self.meta = []
        self.links = []
        self.scripts = []
        self.h_tags = []
        self.current_h = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'title':
            self.in_title = True
        elif tag == 'meta':
            self.meta.append(attrs)
        elif tag == 'link':
            self.links.append(attrs)
        elif tag == 'script':
            self.scripts.append(attrs)
        elif tag in ('h1','h2','h3','h4','h5','h6'):
            self.current_h = {'tag': tag, 'attrs': attrs, 'text': ''}
            self.h_tags.append(self.current_h)
        else:
            self.current_h = None
    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag in ('h1','h2','h3','h4','h5','h6'):
            self.current_h = None
    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.current_h is not None:
            self.current_h['text'] += data

routes = [
'/','/about','/services','/projects','/blog','/contact','/book-a-call','/book-call','/resume','/skills','/goals','/privacy','/terms','/llms.txt','/robots.txt','/sitemap.xml',
'/services/custom-website-development','/services/nextjs-website-development','/services/mern-stack-web-development','/services/api-integration','/services/landing-page-design','/services/seo-friendly-website-setup','/services/website-redesign','/services/website-speed-optimization','/services/admin-dashboard-development','/services/database-integration','/services/e-commerce-website-development','/services/full-stack-web-app-development','/services/portfolio-website-development','/services/maintenance-support',
'/projects/muhyo-tech-portfolio-elite-edition','/projects/muhyo-tech-admin-console','/projects/nova-real-estate-muhyo-tech','/projects/apex-e-commerce-ecosystem','/projects/pulse-health-ai','/projects/vault-crypto-wallet','/projects/zenith-saas-dashboard',
'/blog/beyond-the-surface-engineering-digital-foundations','/blog/beyond-the-meta-tag-engineering-seo-sustainable-discovery','/blog/cybersecurity-startups-practical-hardening','/blog/database-sharding-when-and-why-we-finally-pulled-the-trigger','/blog/engineering-core-web-vitals-real-business-impact','/blog/engineering-reliable-web-form-submissions','/blog/why-we-stopped-building-our-own-authentication-systems','/blog/why-we-finally-sharded-our-database','/blog/how-we-cured-post-merge-panic-devops-automation','/blog/mongodb-aggregation-complex-data-production','/blog/deployment-anxiety-devops-automation','/blog/react-19-actions-pragmatic-guide-senior-developers','/blog/seo-engineering-technical-deep-dives-real-traffic','/blog/serverless-sinkhole-cost-performance','/blog/ai-copy-paste-trap-seamless-llm-workflows','/blog/beyond-the-meta-tag-engineering-seo-sustainable-discovery'
]

base = 'http://127.0.0.1:3000'
results = []
for route in routes:
    url = base + route
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=20)
        content = resp.read().decode('utf-8', errors='replace')
        status = resp.getcode()
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8', errors='replace')
        status = e.code
    except Exception as e:
        results.append({'route': route, 'status': None, 'error': str(e)})
        continue
    parser = HeadParser()
    parser.feed(content)
    links = parser.links
    canonical = next((l.get('href') for l in links if l.get('rel')=='canonical'), None)
    robots = next((m.get('content') for m in parser.meta if m.get('name','').lower()=='robots'), None)
    description = next((m.get('content') for m in parser.meta if m.get('name','').lower()=='description'), None)
    viewport = next((m.get('content') for m in parser.meta if m.get('name','').lower()=='viewport'), None)
    results.append({
        'route': route,
        'status': status,
        'title': parser.title.strip(),
        'description': description,
        'canonical': canonical,
        'robots': robots,
        'charset': next((m.get('charset') for m in parser.meta if 'charset' in m), None),
        'viewport': viewport,
        'h1_count': sum(1 for h in parser.h_tags if h['tag']=='h1'),
        'h2_count': sum(1 for h in parser.h_tags if h['tag']=='h2'),
        'h3_count': sum(1 for h in parser.h_tags if h['tag']=='h3'),
        'h1_texts': [h['text'].strip() for h in parser.h_tags if h['tag']=='h1'],
        'og_tags': [m for m in parser.meta if m.get('property','').startswith('og:') or m.get('name','').startswith('og:')],
        'twitter_tags': [m for m in parser.meta if m.get('name','').startswith('twitter:')],
        'json_ld_count': content.count('application/ld+json'),
        'link_count': len([l for l in parser.links if l.get('href')]),
        'script_count': len(parser.scripts),
    })
print(json.dumps(results, indent=2))
