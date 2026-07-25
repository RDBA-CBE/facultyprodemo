'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Dropdown, useSetState } from '@/utils/function.utils';
import Models from '@/imports/models.import';
import CustomSelect from '../dropdown';

const NewHeroSection = () => {
  const router = useRouter();
  const [state, setState] = useSetState({
    search: '',
    location: '',
    locationList: [],
  });

  useEffect(() => {
    locationList();
  }, []);

  const locationList = async () => {
    try {
      const res: any = await Models.location.list();
      const dropdown: any = Dropdown(res?.results, 'city');
      setState({
        locationList: dropdown,
      });
    } catch (error) {
      console.log('error fetching locations', error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (state.search) params.append('search', state.search);
    if (state.location) params.append('location', state.location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative bg-[#f9fafb] py-20 lg:py-28">
      <div className="section-wid w-full flex flex-col items-center text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-[#1E3786] mb-6">
          Find Your Dream <span className="text-orange-500">Faculty Job</span>
        </h1>
        <p className="text-gray-600 text-lg mb-10 max-w-2xl">
          Discover thousands of academic opportunities at top institutions.
          Start your journey towards a fulfilling career in education today.
        </p>

        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex flex-col sm:flex-row items-center gap-2 w-full max-w-3xl relative z-10">
          <div className="flex items-center flex-1 px-4 py-2 w-full">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Job title, Position, Keyword..."
              className="w-full focus:outline-none text-base bg-transparent"
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

          <div className="flex items-center px-4 py-2 w-full sm:w-auto sm:min-w-[200px]">
            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
            <CustomSelect
              placeholder="City, state"
              options={state.locationList}
              value={state?.location || ''}
              onChange={(selected) =>
                setState({
                  ...state,
                  location: selected ? selected.value : '',
                })
              }
            />
          </div>

          <button
            onClick={handleSearch}
            className="bg-[#1E3786] text-white px-8 py-3 rounded-full text-base font-medium hover:bg-[#080f3d] transition w-full sm:w-auto"
          >
            Find Job
          </button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span>Popular:</span>
          {['Assistant Professor', 'Research Associate', 'Dean'].map((term) => (
            <span
              key={term}
              onClick={() => router.push(`/jobs?search=${encodeURIComponent(term)}`)}
              className="bg-white px-3 py-1 rounded-full border border-gray-200 cursor-pointer hover:border-[#1E3786] transition"
            >
              {term}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewHeroSection;