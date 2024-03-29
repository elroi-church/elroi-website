import { useRouter } from "next/router";
import React, { FC, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormInput } from "../../../../core/components/commons/inputs/FormInput";
import AuthLayout from "../../../../core/components/commons/layouts/AuthLayout";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormTextarea } from "../../../../core/components/commons/inputs/FormTextarea";
import Select from "react-select";
import { useGetAllCityQuery } from "../../../../core/features/area/api/city.api";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { City } from "../../../../core/features/area/models/city.model";
import { State } from "../../../../core/features/area/models/state.model";
import { useGetAllStateQuery } from "../../../../core/features/area/api/state.api";

import { FamilyMemberSection } from "../../../../core/features/family/components/FamilyMemberSection";
import { Family } from "../../../../core/features/family/models/family";
import {
  useGetFamilyDetailQuery,
  useUpdateFamilyMutation,
} from "../../../../core/features/family/api/family.api";
import { FamilyInformation } from "../../../../core/features/family/models/family.type";
import { FamilyRole } from "../../../../core/features/family/models/enums/family-role.enum";
import { toast } from "react-toastify";

export type SelectOption<T> = {
  value: T;
  label: string;
};

export type FamilyMemberInformation = {
  name: string;
  familyRole: FamilyRole;
  birthDate: Date | null;
  birthPlace: string;
  education: string;
  job: string;
  isBaptized: boolean;
};

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    state_id: yup.number().positive().integer().required("State is required"),
    city_id: yup.number().positive().integer().required("City is required"),
    address: yup.string().required("Address is required"),
    district: yup.string().required(),
    postalCode: yup.string().required("Postal code is required"),
    familyPhoneNumber: yup.string().required("Phone number is required"),
  })
  .required();

const FamilyEdit: FC = () => {
  const router = useRouter();

  const id = router.query.id as string;

  const [familyInformation, setFamilyInformation] = useState<Family>();

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<Family>({
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const { data: familyData } = useGetFamilyDetailQuery(
    id ? { id: id } : skipToken,
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );

  useEffect(() => {
    if (familyData) {
      reset(familyData.data);
    }
  }, [familyData, reset]);

  /* React State */
  const [cityList, setCityList] = useState<SelectOption<number>[]>([]);
  const [stateList, setStateList] = useState<SelectOption<number>[]>([]);

  const { data: stateData } = useGetAllStateQuery({
    country_id: 102,
  });

  useEffect(() => {
    if (stateData) {
      const mappedState = stateData.data?.map((state: State) => {
        return {
          value: state._id as number,
          label: state.name as string,
        };
      });
      setStateList(mappedState);
    }

    return () => {
      setStateList([]);
    };
  }, [stateData]);

  const [updateFamily] = useUpdateFamilyMutation();

  const { data: cityData } = useGetAllCityQuery(
    watch("state_id") ? { state_id: watch("state_id") } : skipToken,
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (cityData) {
      const mappedCity = cityData.data?.map((state: City) => {
        return {
          value: state._id as number,
          label: state.name as string,
        };
      });
      setCityList(mappedCity);
    }

    return () => {
      setCityList([]);
    };
  }, [cityData]);

  const [page, setPage] = React.useState<number>(0);

  // create function handle submit form
  const onSubmit = async (data: Family): Promise<void> => {
    try {
      const {
        name,
        state_id,
        city_id,
        address,
        district,
        postalCode,
        familyPhoneNumber,
        hamlet,
        neighbourhood,
      } = data;

      await updateFamily({
        _id: id,
        name,
        state_id,
        city_id,
        address,
        district,
        postalCode,
        familyPhoneNumber,
        hamlet,
        neighbourhood,
      }).unwrap();

      router.push("/dashboard/family");
      toast("Success Mengupdate Data", {
        type: "success",
        autoClose: 2000,
      });
    } catch (e) {
      toast("Gagal Menambahkan Data", {
        type: "error",
      });
    }
  };

  return (
    <AuthLayout>
      <div className="px-5">
        Kartu Keluarga Jemaat
        {/* Section KKJ Information */}
        <section className="shadow-md border border-gray-100 rounded-lg p-5 mb-5">
          <h2 className="text-lg text-left mb-5">KKJ Information</h2>

          <div className="mb-4">
            <FormInput<Partial<Family>>
              name="code"
              label={"NO KKJ"}
              className={"mb-2"}
              id={"code"}
              register={register}
              errors={errors}
              disabled={true}
            />
          </div>

          <div className="mb-4">
            <FormInput<Partial<Family>>
              name="churchArea"
              label={"Rayon"}
              className={"mb-2"}
              id={"churchArea"}
              register={register}
              errors={errors}
              disabled={true}
            />
          </div>

          <div className="mb-4">
            <FormInput<Partial<Family>>
              name="churchName"
              label={"Cabang"}
              className={"mb-2"}
              id={"churchName"}
              register={register}
              errors={errors}
              disabled={true}
            />
          </div>

          <div className="mb-4">
            <FormInput<Partial<Family>>
              name="updatedAt"
              label={"Tanggal Process"}
              className={"mb-2"}
              id={"updatedAt"}
              register={register}
              errors={errors}
              disabled={true}
            />
          </div>
        </section>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Section Family Information  */}
          <section className="shadow-md border border-gray-100 rounded-lg p-5 mb-5">
            <h2 className="text-lg text-left mb-5">Family Information</h2>

            <div className="mb-4">
              <FormInput<Partial<FamilyInformation>>
                name="name"
                label={"Nama Keluarga"}
                className={"mb-2"}
                id={"name"}
                register={register}
                placeholder={"Harap isi nama keluarga"}
                errors={errors}
              />

              <FormTextarea<Partial<FamilyInformation>>
                name="address"
                label={"Alamat Lengkap"}
                id={"address"}
                className={"mb-2"}
                register={register}
                inputClassName={"rounded-xl"}
                placeholder={"Harap isi alamat Lengkap"}
                errors={errors}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-left  text-gray-700 text-sm mb-2"
                htmlFor="name"
              >
                Provinsi
              </label>
              <Controller<Partial<FamilyInformation>>
                control={control}
                name="state_id"
                render={({ field: { onChange, value, name, ref } }) => (
                  <Select
                    ref={ref}
                    name={name}
                    classNamePrefix="addl-class"
                    options={stateList}
                    value={stateList.find((c) => c.value === Number(value))}
                    onChange={(val) => onChange(val?.value)}
                  />
                )}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-left  text-gray-700 text-sm mb-2"
                htmlFor="name"
              >
                Kota/Kabupaten
              </label>
              <Controller<Partial<FamilyInformation>>
                control={control}
                name="city_id"
                render={({ field: { onChange, value, name, ref } }) => (
                  <Select
                    ref={ref}
                    name={name}
                    classNamePrefix="addl-class"
                    options={cityList}
                    value={cityList.find((c) => c.value === Number(value))}
                    onChange={(val) => onChange(val?.value)}
                  />
                )}
              />
            </div>

            <div className="mb-4">
              <FormInput<Partial<FamilyInformation>>
                name="district"
                label={"Kecamatan"}
                className={"mb-2"}
                id={"district"}
                register={register}
                placeholder={"Harap isi Kecamatan"}
                errors={errors}
              />
              <FormInput<Partial<FamilyInformation>>
                name="familyPhoneNumber"
                label={"No Telfon Keluarga"}
                className={"mb-2"}
                id={"familyPhoneNumber"}
                register={register}
                placeholder={"Harap isi No Telfon keluarga"}
                errors={errors}
              />
              <FormInput<Partial<FamilyInformation>>
                name="hamlet"
                label={"RW"}
                className={"mb-2"}
                id={"hamlet"}
                register={register}
                placeholder={"Harap isi RW"}
                errors={errors}
              />
              <FormInput<Partial<FamilyInformation>>
                name="neighbourhood"
                label={"RT"}
                className={"mb-2"}
                id={"neighbourhood"}
                register={register}
                placeholder={"Harap isi RT"}
                errors={errors}
              />
              <FormInput<Partial<FamilyInformation>>
                name="postalCode"
                label={"Kode Pos"}
                className={"mb-2"}
                id={"postalCode"}
                register={register}
                placeholder={"Harap isi Kode Pos"}
                errors={errors}
              />
            </div>

            <div className="text-right">
              <input
                type="submit"
                value="Save / Submit"
                className="block uppercase sm:inline-block py-3 px-8 w-[280px] m-auto rounded-[15px] mb-4 sm:mb-0 sm:mr-3 text-lg text-center font-semibold leading-none border-primary border-2 bg-primary border-transparent text-white hover:cursor-pointer"
              />
            </div>
          </section>
        </form>
        {/* Section Partner */}
        <FamilyMemberSection familyId={id} />
      </div>
    </AuthLayout>
  );
};

export default FamilyEdit;
