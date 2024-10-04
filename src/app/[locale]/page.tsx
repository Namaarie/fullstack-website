import { redirect } from '../../i18n/routing';

export default function Base() {
    return (
        redirect('/home')
    );
}