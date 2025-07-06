# @carlosjunod/react-full-page-scroller

A fully-featured React component for “full-page” scrollable slides. Supports vertical or horizontal scroll
(mouse wheel or touch swipe), animated transitions via Framer Motion, SSR-safe usage, optional dot
navigation controls, and a React Context API for programmatic control.

---

## 📦 Installation

```bash
npm install @carlosjunod/react-full-page-scroller
# or
yarn add @carlosjunod/react-full-page-scroller
```

---

## 🚀 Basic Usage

```jsx
import React from 'react';
import FullPageScroller from '@carlosjunod/react-full-page-scroller';

import SectionOne from './SectionOne';
import SectionTwo from './SectionTwo';
import SectionThree from './SectionThree';

export default function App() {
  return (
    <FullPageScroller>
      <SectionOne />
      <SectionTwo />
      <SectionThree />
    </FullPageScroller>
  );
}
```

---

## ⚙️ Full-Feature Example

This demonstrates:

1. Context-based navigation from anywhere  
2. Dot controls on the **right**  
3. Horizontal scroll  
4. Custom dot component  
5. Scroll callbacks  
6. SSR safety  

```jsx
import React from 'react';
import {
  FullPageScroller,
  FullPageScrollerProvider,
  useFullPageScroller
} from '@carlosjunod/react-full-page-scroller';

// Custom dot component
function MyDot({ active }) {
  return (
    <div
      style={{
        width: active ? 14 : 8,
        height: active ? 14 : 8,
        borderRadius: '50%',
        background: active ? '#ff007f' : '#aaa'
      }}
    />
  );
}

function NavBar() {
  const { next, prev, goTo, currentPage } = useFullPageScroller();
  return (
    <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 100 }}>
      <button onClick={prev}>◀ Prev</button>
      <button onClick={next}>Next ▶</button>
      <button onClick={() => goTo(2)}>Go to 3</button>
      <span style={{ marginLeft: 10 }}>Page: {currentPage + 1}</span>
    </div>
  );
}

export default function App() {
  return (
    <FullPageScrollerProvider
      axis="horizontal"
      threshold={150}
      duration={1}
      control
      controlPos="right"
      dotComponent={MyDot}
      onScrollStart={(i) => console.log('Starting scroll to', i)}
      onScroll={(i) => console.log('Threshold met for', i)}
      onScrollEnd={(i) => console.log('Finished scroll to', i)}
      fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}
    >
      <NavBar />
      <FullPageScroller>
        <SectionOne />
        <SectionTwo />
        <SectionThree />
      </FullPageScroller>
    </FullPageScrollerProvider>
  );
}
```

---

## 🔧 API & Props

### `FullPageScroller` Props

| Prop             | Type                                   | Default     | Description                                                                          |
| ---------------- | -------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| `axis`           | `'vertical'` \| `'horizontal'`         | `'vertical'`| Scroll direction                                                                     |
| `threshold`      | `number`                               | `100`       | Wheel/pointer delta threshold to trigger page change                                 |
| `duration`       | `number`                               | `0.8`       | Animation duration in seconds                                                        |
| `control`        | `boolean`                              | `true`      | Show/hide navigation dots                                                            |
| `controlPos`     | `'top'` \| `'right'` \| `'bottom'` \| `'left'` | `'right'`       | Position of dot controls                                                             |
| `dotComponent`   | `({ active, index }) => ReactNode`     | —           | Custom component for dots                                                            |
| `onScrollStart`  | `(newPage) => void`                    | —           | Called when scroll threshold begins                                                  |
| `onScroll`       | `(newPage) => void`                    | —           | Called once threshold is passed                                                      |
| `onScrollEnd`    | `(newPage) => void`                    | —           | Called after animation completes                                                     |
| `fallback`       | `ReactNode`                            | `null`      | Suspense fallback for lazy-loaded slides                                             |
| `enabled`        | `boolean`                              | `true`      | When `false`, disables full-page scrolling and allows normal scrolling behavior       |

### Context API

Wrap with provider:

```jsx
<FullPageScrollerProvider {...same props as FullPageScroller}>
  <YourNav />
  <FullPageScroller>…</FullPageScroller>
  <OtherComponent />
</FullPageScrollerProvider>
```

Use hook:

```js
const { next, prev, goTo, currentPage } = useFullPageScroller();
```

---

## 📦 Building & Publishing

```bash
npm install
npm run build
npm publish --access public
```

---
