import { unstable_setRequestLocale } from 'next-intl/server';
import { redirect } from '../../i18n/routing';

export default function Base({params: {locale}} : {params: {locale: string}}) {
    unstable_setRequestLocale(locale);
    return (
        redirect('/home')
    );
}