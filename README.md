<p align="center">
  <a href="https://matomeishi.vercel.app">
    <img src="/palmtree.png" width="60" />
  </a>
</p>
<h1 align="center">
  matomeishi.vercel.app
</h1>

The application I've developed is a versatile web-based platform accessible on both desktop and mobile browsers.

It offers a seamless solution for effortlessly managing business cards. Users can easily scan and store their business cards, utilizing Optical Character Recognition (OCR) technology to extract and identify text information from the cards 🤖

This feature enables automatic population of relevant fields, reducing manual data entry 📝

The application also includes a robust search functionality, allowing users to quickly retrieve cards using free-text queries or associated tags 🔍

 With this tool, individuals no longer need to juggle physical business cards. They can simply upload them to the application and dispose of the physical copies, streamlining their networking and contact management experience 🤩

## 📚 Technologies
```
NextJS 13
React 18
TypeScript 5
Tailwind CSS 3
shadcn/ui
Firebase Authentication
```

- 🚀 matomeishi (front-end) is implemented with NextJS 13 and deployed with <a href="https://vercel.com/tonystrawberry/matomeishi" target="_blank">Vercel</a>

- 🖥 matomeishi (back-end) is implemented with <a href="https://github.com/tonystrawberry/matomeishi-rails.jp" target="_blank">Rails API</a>

## 🛠 Local development

1. Set the necessary environment variables in the `.env.local` file.

```
NEXT_PUBLIC_SERVER_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_HOST_URL=http://localhost:3001

# The following environment variables are required for Firebase authentication.
# Please create a Firebase project, enable authentication and set the values accordingly.
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

```

2. Run the following commands.
```
$ npm install
$ npm run dev
```

3. Run the Rails web server. Please check the <a href="https://github.com/tonystrawberry/matomeishi-rails.jp" target="_blank">backend repository</a> for more details.

4. Access the web application via the following URL.
```
http://localhost:3001
```

## ⚙️ Deployment

The application is deployed to production with <a href="https://vercel.com/tonystrawberry/matomeishi" target="_blank">Vercel</a> every time a pull request is merged into the `main` branch.
Vercel also has preview deployments enabled for pull requests.

## 📝 Memo to myself

- The use of HOC (Higher Order Component) was perfect for checking if the user is authenticated or not (see `withAuth.tsx`). I was able to reuse the logic in multiple pages.
It shows an loading page while the authentication status is being checked. If the user is not authenticated, it redirects to the login page.

- React Context API was used to manage the state of the authentication globally. It was a good practice to use the Context API to avoid prop drilling.

- shadcn/ui sped up the development process. It was easy to customize the UI components and the UI was consistent throughout the application.

- First time using Tailwind CSS. It was a good practice to use Tailwind CSS to avoid writing custom CSS. It was easy to customize the UI and the UI was consistent throughout the application. No supplementary CSS was written 🎉

- I didn't make use of server-side rendering (SSR) provided by NextJS. I would like to explore this feature in the future.
