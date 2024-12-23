"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LegacyRef, ReactNode, RefAttributes, RefObject, useRef } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import {
  NameFormData,
  postCreatingRoom,
  putRenamingCanvas,
  RenameFormData,
} from "@/services/canvas/canvas-crud";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "./query-provider";
import { Loader2 } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { useCookies } from "react-cookie";
import { AxiosError } from "axios";

interface NamingModalProps {
  children: ReactNode;
  description: string;
  buttonName: string;
  defaultValue?: string;
  type: "rename" | "create";
}

export default function NamingModal({
  children,
  description,
  buttonName,
  defaultValue,
  type,
}: NamingModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormData>({
    defaultValues: {
      clothesName: defaultValue,
    },
  });
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);

  const router = useRouter();

  const closeRef = useRef<HTMLDivElement>(null);

  // 캔버스 생성 mutation
  const mutationAfterCreation = useMutation({
    mutationFn: (fromData: NameFormData) =>
      postCreatingRoom(fromData, cookies.accessToken),
    onSuccess: (data) => {
      // await queryClient.invalidateQueries({ queryKey: ["AlldesignCanvas"] });
      router.push(`/design/${data.clothesName}`);
    },
    onError: (error) => {
      const axiosError = error as AxiosError;
      if (axiosError.status === 409)
        toast.error("동일한 디자인 캔버스 이름이 있습니다.");
      else toast.error("디자인 캔버스 생성에 실패했습니다");
    },
  });

  // 캔버스 이름 변경 mutation
  const mutationAfterRenaming = useMutation({
    mutationFn: (fromData: RenameFormData) =>
      putRenamingCanvas(fromData, cookies.accessToken),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["AlldesignCanvas"] });
      if (closeRef.current) {
        closeRef.current.click();
      }
      toast.error("디자인 캔버스 이름이 성공적으로 변경되었습니다.");
    },
    onError: (error) => {
      toast.error("디자인 캔버스 이름 수정 중 문제가 발생했습니다.");
    },
  });

  // // 캔버스 생성 함수
  // const onCreateCanvas = async (fromData: NameFormData) => {
  //   try {
  //     const data = await postCreatingRoom(fromData);
  //     const { clothesName } = data;
  //     router.push(`/design/${clothesName}`);
  //   } catch (error) {
  //     toast.error("디자인 캔버스 생성에 실패했습니다");
  //   }
  // };

  const onCreateCanvas = (formData: NameFormData) => {
    console.log(formData);
    mutationAfterCreation.mutate(formData);
  };

  // 캔버스 이름 수정 함수
  const onRenameCanvas = async (fromData: NameFormData) => {
    if (defaultValue) {
      const body = {
        oldClothesName: defaultValue,
        newClothesName: fromData.clothesName,
      };
      mutationAfterRenaming.mutate(body);
    } else {
      return;
    }
  };

   const canvasNameRegex = /^[a-zA-Z0-9가-힣!@#$%^&*()?_~]{1,16}$/;


  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>디자인 캔버스 이름</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Input
          {...register("clothesName", {
            required: "캔버스 이름을 입력해주세요",
            maxLength: {
              value: 16,
              message: "16자 이하로 입력해주세요",
            },
            pattern: {
              value: canvasNameRegex,
              message: "영어 대소문자, 숫자, 한글, 특수문자로 구성헤주세요",
            },
          })}
          className="focus-visible:border-indigo-600 focus-visible:ring-indigo-600"
        />
        {errors.clothesName && (
          <div className="my-1 text-xs text-rose-600">
            {errors.clothesName.message}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <div ref={closeRef} className="hidden">
              Close
            </div>
          </DialogClose>
          <Button
            disabled={
              type === "create"
                ? mutationAfterCreation.isPending
                : mutationAfterRenaming.isPending
            }
            variant="action"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(
                type === "create" ? onCreateCanvas : onRenameCanvas,
              )();
            }}
          >
            {(type === "create"
              ? mutationAfterCreation.isPending
              : mutationAfterRenaming.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {buttonName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
