import Divider from "@/components/divider"
import Stack from "@mui/material/Stack/Stack"
import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';

export default function Home({params: {locale}} : {params: {locale: string}}) {
    unstable_setRequestLocale(locale);
    const t = useTranslations("Home");
    return <div className="main_content_div">
        <Divider/>
        <div className="m-10">
            <div className="text-2xl font-medium mb-5">
                {t('Home')}
            </div>
            <div className="leading-loose">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam maximus magna massa, interdum gravida mi commodo sit amet. Quisque lacinia sagittis rhoncus. Aliquam aliquam consectetur ante ac fringilla. Sed gravida turpis ac enim rutrum scelerisque. Vivamus scelerisque ut orci iaculis semper. Duis ex nunc, iaculis ac ornare in, venenatis ut dolor. Maecenas quis egestas massa. In rhoncus metus sed est aliquet mattis. Maecenas libero nisi, faucibus at fringilla quis, molestie id sapien. Pellentesque scelerisque laoreet turpis ut laoreet. Etiam nec odio a lorem egestas venenatis vel in sem. Nam facilisis velit id risus sagittis, sed tincidunt ipsum ultrices. Aenean vitae augue vitae tellus consectetur luctus. Maecenas iaculis nisi libero, vel sollicitudin ipsum suscipit id. Morbi sed justo vehicula, dictum risus et, pellentesque elit.
            </div>
        </div>
        <Divider/>
        <div className="">
            <Stack direction="row" className="flex my-10" divider={<div className="w-0.5 border"></div>}>
            <div className="mx-auto w-1/2">
                <div className="w-1/2 h-[284px] mx-auto bg-red-400 rounded-xl"></div>
            </div>
            <div className="mx-auto w-1/2">
                <Stack className="mx-auto w-1/2">
                    <div className="text-2xl font-medium mb-5">Nulla Commodo</div>
                    <div className="leading-loose">Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque a ipsum ac velit tincidunt facilisis. In fringilla tempor accumsan.</div>
                </Stack>
            </div>
            </Stack>
        </div>
        <Divider/>
        <div className="flex">
            <Stack direction="row" className="mx-auto my-10" divider={<div className="h-0.5 w-60 my-auto border border-lime-400"></div>}>
                <div className="w-[568px] h-[284px] rounded-xl bg-blue-400"></div>
                <div className="w-[568px] h-[284px] rounded-xl bg-purple-400"></div>
            </Stack>
        </div>
        <Divider/>
    </div>

}