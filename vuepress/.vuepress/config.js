module.exports = {
  dest: 'docs',
  base: '/js-memory/',
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'JS内存分析',
      description: 'js内存分析工具'
    }
  },
  head: [],
  plugins: [],
  themeConfig: {
    repo: 'linjinze999/js-memory',
    docsRepo: 'linjinze999/js-memory',
    docsDir: 'docs',
    // editLinks: true,
    // sidebarDepth: 0,
    locales: {
      '/': {
        label: '简体中文',
        selectText: '选择语言',
        editLinkText: '帮我改进此页',
        lastUpdated: '上次更新',
        nav: [
          {
            text: 'V8(Chrome)',
            link: '/V8/',
          },
          {
            text: 'JSC(Safari)',
            link: '/JSC/',
          }
        ],
        sidebar: {
          '/V8/': [
            {
              title: '堆快照',
              collapsable: false,
              children: [
                'snapshot/statistics',
                'snapshot/summary',
                'snapshot/comparison',
                'snapshot/containment',
              ]
            },
            {
              title: '时间轴上的分配插桩',
              collapsable: false,
              children: [
                'timeline/statistics',
                'timeline/summary',
                'timeline/comparison',
                'timeline/containment',
              ]
            },
            {
              title: '分配采样',
              collapsable: false,
              children: [
                'profile/chart',
              ]
            },
          ]
        }
      }
    }
  },
  configureWebpack: {
    resolve: {extensions: [".ts",".js"]},
    module: {
      rules: [
        {test: /\.ts$/, loader: "ts-loader"}
      ]
    }
  }
};
