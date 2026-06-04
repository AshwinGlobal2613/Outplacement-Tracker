/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/',              destination: '/global'              },
        { source: '/about-us',      destination: '/global/about-us'     },
        { source: '/contact',       destination: '/global/contact'       },
        { source: '/capabilities',  destination: '/global/capabilities'  },
        { source: '/assessments',   destination: '/global/assessments'   },
      ],
    }
  },
}

module.exports = nextConfig
