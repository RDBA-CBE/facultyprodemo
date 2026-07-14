import {  ArrowLeft, ArrowRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

const PaginationCom = ({ page, next, prev, onNext, onPrev }) => {
  return (
    <Pagination>
      <PaginationContent className="flex gap-4">
        {/* Previous */}

        <PaginationItem>
          <div className={`bg-clr2 p-2 rounded-lg cursor-pointer  ${!prev && "opacity-50 cursor-not-allowed"}`}>
            <ArrowLeft
             
              onClick={(e) => {
                e.preventDefault();
                onPrev();
              }}
            />
          </div>
        </PaginationItem>

        {/* Current Page */}
        {/* <PaginationItem>
          <PaginationLink href="#" isActive>
            {page}
          </PaginationLink>
        </PaginationItem> */}

        {/* Next */}

        <PaginationItem>
          <div className={`bg-clr2 p-2 rounded-lg cursor-pointer  ${!next && "opacity-50 cursor-not-allowed"}`}>
            {" "}
            <ArrowRight
              onClick={(e) => {
                e.preventDefault();
                onNext();
              }}
            />
          </div>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationCom;
