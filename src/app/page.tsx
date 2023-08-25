"use client";

import useOnclickOutside from "react-cool-onclickoutside";
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import {useLoadScript} from "@react-google-maps/api";
import {useEffect, useState} from "react";

export default function Home() {
    const {isLoaded} = useLoadScript({
        googleMapsApiKey: "AIzaSyCvx13aAFhHhM1TFdyw3YPfGQUARVCl0y4",
        libraries: ['places'],
    })

    const [selected, setSelected] = useState<string>("")

    if (!isLoaded) return <div>Loading...</div>

    return (
        <>
            <div>
                <PlacesAutocomplete setSelected={setSelected} />
            </div>
            <div>
                <Slots address={selected} />
            </div>
        </>
    )
}

const Slots = ({address}: { address: string }) => {

    const [data, setData] = useState<any>([])

    useEffect(() => {
        if (address === "") {
            return
        }
        fetch(`http://localhost:8080/api/slots?address=${address}`)
            .then((res) => res.json())
            .then((data) => {
                setData(data)
            })
    }, [address])

    return (
        <>
            {data}
        </>
    )
}

const PlacesAutocomplete = ({setSelected} : {setSelected: any}) => {
    const {
        ready,
        value,
        suggestions: {status, data},
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        initOnMount: true,
        debounce: 300,
    });
    const ref = useOnclickOutside(() => {
        clearSuggestions();
    });

    const handleInput = (e: any) => {
        setValue(e.target.value);
    };

    const handleSelect = ({description}: { description: string }) => {
        return () => {
            // When the user selects a place, we can replace the keyword without request data from API
            // by setting the second parameter to "false"
            setValue(description, false);
            clearSuggestions();

            // Get latitude and longitude via utility functions
            getGeocode({address: description}).then((results) => {
                const {lat, lng} = getLatLng(results[0]);
                console.log("📍 Coordinates: ", {lat, lng});
            });
            setSelected(description)
        };
    };
    const renderSuggestions = () =>
        data.map((suggestion) => {
            const {
                place_id,
                structured_formatting: {main_text, secondary_text},
            } = suggestion;

            return (
                <li key={place_id} onClick={handleSelect(suggestion)}
                    className="pl-8 pr-2 py-1 rounded-lg border-gray-100 relative cursor-pointer hover:bg-yellow-50 hover:text-gray-900">
                    <strong>{main_text}</strong> <small>{secondary_text}</small>
                </li>
            );
        });


    return (
        <div className="m-32">
            <div className='max-w-md mx-auto' ref={ref}>
                <div
                    className="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden">
                    <div className="grid place-items-center h-full w-12 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>

                    <input
                        className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                        type="text"
                        id="search"
                        value={value}
                        onChange={handleInput}
                        disabled={!ready}
                        placeholder="Search something.."/>

                </div>
                {status === "OK" ?
                    (<ul className="bg-white border border-gray-100 w-full mt-2 rounded-sm">
                            {renderSuggestions()}
                        </ul>
                    ) : (<div></div>)
                }
            </div>
        </div>
    )
}
