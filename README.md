This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 本地启动

进入项目目录并安装依赖：

```bash
cd ~/ai-education-website
npm install --package-lock=false
```

启动开发服务器：

```bash
npm run dev
```

终端显示服务已就绪后，可以在浏览器中访问：

- 首页：[http://localhost:3000](http://localhost:3000)
- 课程页：[http://localhost:3000/courses/ai-basics/what-is-ai](http://localhost:3000/courses/ai-basics/what-is-ai)

开发模式支持热更新，修改源码后页面会自动刷新。结束预览时，在运行开发服务器的终端中按 `Ctrl+C`。

安装依赖时可能出现可选 WASM 依赖的 peer dependency 警告；只要安装最终显示成功，就不影响本地预览。不要直接运行 `npm audit fix --force`，因为它可能引入破坏性依赖升级。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
