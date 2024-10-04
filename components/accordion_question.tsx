import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function AccordionQuestion({question="", detail=""}) {
    return (
        <div className="mx-auto my-2 w-1/2">
            <Accordion className="">
                <AccordionSummary
                    expandIcon={<ArrowDropDownIcon />}
                    className="font-medium text-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-50">
                    <span className="mx-auto">{question}</span>
                </AccordionSummary>
                <AccordionDetails>{detail}</AccordionDetails>
                
            </Accordion>
        </div>
    );
}