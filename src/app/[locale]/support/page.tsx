import AccordionQuestion from "@/components/accordion_question"
import Divider from "@/components/divider"

export default function Support() {
    return <div className="main_content_div">
        <Divider/>
        <div className="p-8">
            <AccordionQuestion question="Question 1" detail="lorem ipsum"/>
            <AccordionQuestion question="Question 2" detail="lorem ipsum"/>
            <AccordionQuestion question="Question 3" detail="lorem ipsum"/>
            <AccordionQuestion question="Question 4" detail="lorem ipsum"/>
            <AccordionQuestion question="Question 5" detail="lorem ipsum"/>
        </div>
        <Divider/>
    </div>
}