"use client";

import {useEffect, useState} from "react";
import {Card, CardBody} from "@nextui-org/card";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/modal";
import {DropdownItem, useDisclosure} from "@nextui-org/react";
import {Input} from "@nextui-org/input";
import {AvatarIcon} from "@nextui-org/shared-icons";
import {Button} from "@nextui-org/button";
import {Dropdown, DropdownMenu, DropdownTrigger} from "@nextui-org/dropdown";
import MapInputAutocomplete from "@/components/MapInputAutocomplete";
import {useLoadScript} from "@react-google-maps/api";

export default function Admin() {
    const {isLoaded} = useLoadScript({
        googleMapsApiKey: "AIzaSyCvx13aAFhHhM1TFdyw3YPfGQUARVCl0y4",
        libraries: ['places'],
    })
    const [instructorSelected, setInstructorSelected] = useState<any>("")
    const [slotSelected, setSlotSelected] = useState(null)
    const [addressSelected, setAddressSelected] = useState(null)
    const [studentName, setStudentName] = useState("")

    const [instructors, setInstructors] = useState<any>([])
    const [data, setData] = useState<any>([])
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();


    useEffect(() => {
        fetch(`http://localhost:8080/api/appointments`)
            .then((res) => res.json())
            .then((res) => {
                setData(res)
            });
        fetch(`http://localhost:8080/api/instructors`)
            .then((res) => res.json())
            .then((res) => {
                setInstructors(res)
            });

    }, []);

    const closeHandler = async () => {
        if (instructorSelected != "" && slotSelected && addressSelected && studentName != "") {
            console.log(addressSelected)
            console.log("can make appointment")
        }
        const data = {
            instructor_id: instructorSelected.id,
            studetn_name: studentName,
            student_address: addressSelected,
            slot: Number(slotSelected)
        }
        const response = await fetch('http://localhost:8080/api/appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            console.log('Appointment successfully made.');
        } else {
            console.error('Failed to make appointment.');
        }
        onClose();
    }

    return (
        <div>
            <div className="gap-2 grid grid-cols-2 sm:grid-cols-4 m-12">
                {data.map((item: any, index: any) => (
                    <Card shadow="sm" key={index} isPressable onPress={() => console.log("item pressed")}>
                        <CardBody className="overflow-hidden p-1 m-5 h-full">
                            <div className="mb-3">
                                <h5 className="mb-0">Instructor: {item.instructorName}</h5>
                            </div>
                            <div className="mb-3">
                                <h5 className="mb-0">Student: {item.studentName}</h5>
                            </div>
                            <div className="mb-3">
                                <h5 className="mb-0">Lesson Slot: {item.lessonSlot}</h5>
                            </div>
                            <div className="mb-0">
                                <h5 className="mb-0">Location:</h5>
                                <p className="mb-0">{item.pickupAddress}</p>
                            </div>
                        </CardBody>
                    </Card>
                ))}
                <Card shadow="sm" isPressable onPress={onOpen}>
                    <CardBody className="overflow-hidden h-full grid place-items-center bg-amber-200">
                        <div className="flex items-center justify-center w-16 h-16">
                            <div className="w-2 h-10 bg-black absolute"></div>
                            <div className="w-10 h-2 bg-black absolute"></div>
                        </div>
                    </CardBody>
                </Card>
            </div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Appointment Information</ModalHeader>
                            <ModalBody>
                                <Input
                                    autoFocus
                                    endContent={
                                        <AvatarIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                    }
                                    radius={"sm"}
                                    label="Student Name"
                                    placeholder="Enter student name"
                                    variant="bordered"
                                    value={studentName}
                                    onValueChange={setStudentName}
                                />
                                <div className="h-full w-full border-2 rounded-lg">
                                    <MapInputAutocomplete setSelected={setAddressSelected} placeholder={"Type the address here"} />
                                </div>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button
                                            variant="bordered"
                                        >
                                            {instructorSelected === "" ? "Select Instructor" : instructorSelected.name}
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Dynamic Actions" items={instructors}>
                                        {(item: any) => (
                                            <DropdownItem
                                                key={item.id}
                                                color={"default"}
                                                onPress={() => setInstructorSelected(item)}
                                            >
                                                {item.name}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button
                                            {...(instructorSelected === "" ? {isDisabled: true} : {})}
                                            variant="bordered"
                                        >
                                            {slotSelected === null ? "Select lesson slot" : slotSelected}
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Dynamic Actions" items={instructorSelected.availableSlots}>
                                        {(item: any) => (
                                            <DropdownItem
                                                key={item.key}
                                                color={"default"}
                                                onPress={() => setSlotSelected(item.key)}
                                            >
                                                {item.value}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={closeHandler}>
                                    Make an appointment
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}