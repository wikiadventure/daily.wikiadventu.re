import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('../pages/Home.vue'),
    },
    {
        path: '/result/:lang',
        component: () => import('../pages/Result.vue')
    },
    {
        path: '/:catchAll(.*)*',
        component: () => import('../pages/Error404.vue'),
    },
];

export default routes;
