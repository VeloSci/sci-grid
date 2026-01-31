import type { Theme } from 'vitepress';
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
import NeonLanding from '../../components/NeonLanding.vue';
import NeonGridDemo from '../../components/NeonGridDemo.vue';
import ScientificDemo from '../../components/ScientificDemo.vue';
import './style.css';

const theme: Theme = {
  extends: DefaultTheme,
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
    app.component('NeonLanding', NeonLanding);
    app.component('NeonGridDemo', NeonGridDemo);
    app.component('ScientificDemo', ScientificDemo);
  }
};

export default theme;
