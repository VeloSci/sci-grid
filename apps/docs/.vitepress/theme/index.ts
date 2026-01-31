import DefaultTheme from 'vitepress/theme';
import BasicDemo from '../../components/BasicDemo.vue';
import MillionRowsDemo from '../../components/MillionRowsDemo.vue';
import './style.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('BasicDemo', BasicDemo);
    app.component('MillionRowsDemo', MillionRowsDemo);
  }
};
