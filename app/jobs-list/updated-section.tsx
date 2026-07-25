import { Facebook, Twitter, Linkedin, X, Star, Briefcase, Clock, DollarSign, MapPin } from "lucide-react";

export default function UpdatedSection({ selectedJob }: any) {
  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-start justify-between mb-6">
        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">
          {selectedJob.postedDate}
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Facebook size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Twitter size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Linkedin size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <img src={selectedJob.logo} alt={selectedJob.company} className="w-16 h-16 rounded-lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{selectedJob.title}</h1>
              <Star className="w-6 h-6 text-gray-300 hover:text-amber-400 cursor-pointer" />
            </div>
            <p className="text-lg text-gray-600 mb-6">{selectedJob.company}</p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                </div>
                <span>{selectedJob.experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <span>{selectedJob.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                </div>
                <span>{selectedJob.salary}-{selectedJob.salary.replace('$', '$' + (parseInt(selectedJob.salary.replace('$', '')) + 6000))}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <span>{selectedJob.location}</span>
              </div>
            </div>
          </div>
        </div>
        <button className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-lg">
          Apply Job
        </button>
      </div>
    </div>
  );
}
