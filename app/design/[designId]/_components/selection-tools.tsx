"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { Camera } from "@/types/canvas";
import { useMutation, useSelf } from "@liveblocks/react/suspense";
import { memo, useState } from "react";
import { Hint } from "@/components/ui/hint";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useDeleteLayers from "@/hooks/use-delete-layers";
import { RiSendBackward, RiBringForward } from "react-icons/ri";
import Image from "next/image";

interface SelectionToolsProps {
  camera: Camera;
}

export const SelectionTools = memo(({ camera }: SelectionToolsProps) => {
  const [activeFontFamily, setActiveFontFamily] = useState<string>("Open Sans");
  const selection = useSelf((me) => me.presence.selection);
  const [iconColor, setIconColor] = useState<string>("000000");

  // const setFill = useMutation(({ storage }, fill: Color) => {
  //   const liveLayers = storage.get("layers");
  //   // setLastUsedColor(fill);

  //   selection.forEach((id) => {
  //     const layer = liveLayers.get(id);

  //     // text layer인 경우
  //     if (layer && layer.toObject().type === LayerType.Text) {
  //       const textLayer = layer as LiveObject<TextLayer>;
  //       textLayer.set("fill", fill);
  //     }
  //   });
  // }, []);

  // const isSelectedTextLayerOnly = useMutation(({ storage }) => {
  //   const liveLayers = storage.get("layers");
  //   if (selection.length === 1) {
  //     const layer = liveLayers.get(selection[0]);
  //     // const layer = useStorage((root) => root.layers.get(selection[0]));
  //     if (layer && layer.toObject().type === LayerType.Text) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }, []);

  const moveToFront = useMutation(
    ({ storage }) => {
      const liveLayerIds = storage.get("layerIds");
      const indices: number[] = [];

      const arr = liveLayerIds.toArray();

      for (let i = 0; i < arr.length; i++) {
        if (selection?.includes(arr[i])) {
          indices.push(i);
        }
      }

      for (let i = indices.length - 1; i >= 0; i--) {
        liveLayerIds.move(
          indices[i],
          arr.length - 1 - (indices.length - 1 - i),
        );
      }
    },
    [selection],
  );

  const moveToBack = useMutation(
    ({ storage }) => {
      const liveLayerIds = storage.get("layerIds");
      const indices: number[] = [];

      const arr = liveLayerIds.toArray();

      for (let i = 0; i < arr.length; i++) {
        if (selection?.includes(arr[i])) {
          indices.push(i);
        }
      }

      for (let i = 0; i < indices.length; i++) {
        liveLayerIds.move(indices[i], i);
      }
    },
    [selection],
  );

  const deleteLayers = useDeleteLayers();

  const selectionBounds = useSelectionBounds();
  if (!selectionBounds) {
    return null;
  }

  const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
  const y = selectionBounds.y + camera.y;

  return (
    <div
      className="absolute flex select-none rounded-xl border bg-white px-2.5 py-1.5 shadow-sm"
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
      }}
    >
      {/* <ColorPicker onChange={setFill} /> */}
      <div className="mr-2 flex items-center border-r border-neutral-200 pr-2">
        <Hint label="배경 제거">
          <Button onClick={moveToFront} variant="design" size="icon">
            <Image
              onMouseEnter={() => {
                setIconColor("4f46e5");
              }}
              onMouseLeave={() => {
                setIconColor("000000");
              }}
              src={`https://img.icons8.com/?size=200&id=99733&format=png&color=${iconColor}`}
              alt="icon"
              width={21}
              height={21}
            />
          </Button>
        </Hint>
      </div>

      <Hint label="앞으로 가져오기">
        <Button onClick={moveToFront} variant="design" size="icon">
          <RiBringForward className="text-2xl" />
        </Button>
      </Hint>
      <Hint label="뒤로 보내기">
        <Button onClick={moveToBack} variant="design" size="icon">
          <RiSendBackward className="text-2xl" />
        </Button>
      </Hint>
      <div className="ml-2 flex items-center border-l border-neutral-200 pl-2">
        <Hint label="삭제하기">
          <Button variant="design" size="icon" onClick={deleteLayers}>
            <Trash2 className="w-5" />
          </Button>
        </Hint>
      </div>
    </div>
  );
});

SelectionTools.displayName = "SelectionTools";
