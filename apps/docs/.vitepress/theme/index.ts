import DefaultTheme from 'vitepress/theme';
import BasicDemo from '../../components/BasicDemo.vue';
import MillionRowsDemo from '../../components/MillionRowsDemo.vue';
import ColumnTypesDemo from '../../components/ColumnTypesDemo.vue';
import ThemingDemo from '../../components/ThemingDemo.vue';
import SortingDemo from '../../components/SortingDemo.vue';
import EditingDemo from '../../components/EditingDemo.vue';
import HeadersDemo from '../../components/HeadersDemo.vue';
import SelectionDemo from '../../components/SelectionDemo.vue';
import StreamingDemo from '../../components/StreamingDemo.vue';
import VisualsDemo from '../../components/VisualsDemo.vue';
import './style.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('BasicDemo', BasicDemo);
    app.component('MillionRowsDemo', MillionRowsDemo);
    app.component('ColumnTypesDemo', ColumnTypesDemo);
    app.component('ThemingDemo', ThemingDemo);
    app.component('SortingDemo', SortingDemo);
    app.component('EditingDemo', EditingDemo);
    app.component('HeadersDemo', HeadersDemo);
    app.component('SelectionDemo', SelectionDemo);
    app.component('StreamingDemo', StreamingDemo);
    app.component('VisualsDemo', VisualsDemo);
  }
};
