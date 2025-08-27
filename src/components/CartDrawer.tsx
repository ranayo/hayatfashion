"use client";

import { Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useCart from "@/hooks/useCart";

type Props = {
  open: boolean;
  onClose: () => void;
};

const fmt = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" });

export default function CartDrawer({ open, onClose }: Props) {
  const { items = [], setItemQty, removeFromCart } = useCart() as any;

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum: number, it: any) =>
          sum + (Number(it?.price) || 0) * (Number(it?.qty) || 0),
        0
      ),
    [items]
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
        </Transition.Child>

        {/* Slide-in panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Shopping cart
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      {items.length === 0 ? (
                        <p className="text-sm text-gray-500">Your cart is empty.</p>
                      ) : (
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {items.map((it: any, i: number) => (
                            <li key={i} className="flex py-6">
                              <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                <Image
                                  src={
                                    it?.image || it?.images?.[0] || "/product-1.png"
                                  }
                                  alt={it?.title || "Product"}
                                  width={96}
                                  height={96}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3 className="pr-3 line-clamp-2">
                                    <Link
                                      href={`/category/${encodeURIComponent(
                                        it?.category || ""
                                      )}/${it?.productId || it?.id || ""}`}
                                    >
                                      {it?.title || "Product"}
                                    </Link>
                                  </h3>
                                  <p className="ml-4 whitespace-nowrap">
                                    {fmt.format(Number(it?.price) || 0)}
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  {it?.color ? (
                                    <>
                                      Color: <span className="font-medium">{it.color}</span>
                                      {" · "}
                                    </>
                                  ) : null}
                                  {it?.size ? (
                                    <>
                                      Size: <span className="font-medium">{it.size}</span>
                                    </>
                                  ) : null}
                                </p>

                                <div className="mt-auto flex items-end justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      aria-label="Decrease quantity"
                                      className="h-7 w-7 rounded-md ring-1 ring-gray-300 hover:bg-gray-50"
                                      onClick={() =>
                                        setItemQty?.(
                                          {
                                            productId: it.productId ?? it.id,
                                            size: it.size,
                                            color: it.color,
                                          },
                                          Math.max(1, (Number(it.qty) || 1) - 1)
                                        )
                                      }
                                    >
                                      –
                                    </button>
                                    <span className="w-6 text-center tabular-nums">
                                      {it?.qty ?? 1}
                                    </span>
                                    <button
                                      aria-label="Increase quantity"
                                      className="h-7 w-7 rounded-md ring-1 ring-gray-300 hover:bg-gray-50"
                                      onClick={() =>
                                        setItemQty?.(
                                          {
                                            productId: it.productId ?? it.id,
                                            size: it.size,
                                            color: it.color,
                                          },
                                          (Number(it.qty) || 0) + 1
                                        )
                                      }
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    onClick={() =>
                                      removeFromCart?.({
                                        productId: it.productId ?? it.id,
                                        size: it.size,
                                        color: it.color,
                                      })
                                    }
                                    className="font-medium text-[#c8a18d] hover:text-[#a47e6d]"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>{fmt.format(subtotal)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Shipping and taxes calculated at checkout.
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/checkout"
                          className="flex w-full items-center justify-center rounded-md bg-[#c8a18d] px-6 py-3 text-base font-medium text-white hover:bg-[#4b3a2f] transition"
                        >
                          Checkout
                        </Link>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{" "}
                          <button
                            onClick={onClose}
                            className="font-medium text-[#c8a18d] hover:text-[#4b3a2f]"
                          >
                            Continue shopping<span aria-hidden="true"> →</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
