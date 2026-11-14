/** @type {import('next').NextConfig} */

const isGithubActions = process.env.GITHUB_ACTIONS || false
const isLocalBuild = process.env.LOCAL_BUILD || false

let assetPrefix = ''
let basePath = ''

// 如果在 GitHub Actions 中运行，则设置 assetPrefix 和 basePath
if (isGithubActions) {
  const repo = 'dhsheet'
  assetPrefix = `/${repo}`
  basePath = `/${repo}`
}

// 如果是本地构建，使用相对路径
if (isLocalBuild) {
  assetPrefix = './'
  basePath = ''
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  assetPrefix: assetPrefix,
  basePath: basePath,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // These dependencies ship optional chaining/nullish coalescing in their ESM
  // distributions. Compile them for the same browsers as application code.
  transpilePackages: [
    'uuid',
    'dexie',
    '@radix-ui/react-slot',
    '@radix-ui/react-id',
    '@radix-ui/primitive',
    '@radix-ui/react-context',
    '@radix-ui/react-use-layout-effect',
    '@radix-ui/react-use-callback-ref',
    '@radix-ui/react-use-controllable-state',
    '@radix-ui/react-dismissable-layer',
    '@radix-ui/react-use-escape-keydown',
    'framer-motion',
    'motion-dom',
    'motion-utils',
    'zod',
    'tailwind-merge',
    '@uiw/react-md-editor',
    '@uiw/react-markdown-preview',
    'remark-github-blockquote-alert',
  ],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
    return config
  },
};

export default nextConfig;
