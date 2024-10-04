import { redirect } from 'next/navigation'

export default function Base() {
    return (
        redirect('/admin/register')
    );
}