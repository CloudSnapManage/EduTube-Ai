
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Send, Youtube } from "lucide-react"; // Added Youtube icon

const formSchema = z.object({
  videoUrl: z.string().url({ message: "Please enter a valid YouTube URL." })
    .refine(url => url.includes("youtube.com") || url.includes("youtu.be"), {
      message: "URL must be a valid YouTube link (youtube.com or youtu.be)."
    }),
});

type UrlInputFormValues = z.infer<typeof formSchema>;

interface UrlInputFormProps {
  onSubmit: (videoUrl: string) => void;
  isLoading: boolean;
}

export function UrlInputForm({ onSubmit, isLoading }: UrlInputFormProps) {
  const form = useForm<UrlInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
    },
  });

  const handleFormSubmit: SubmitHandler<UrlInputFormValues> = (data) => {
    onSubmit(data.videoUrl);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center">
                <Youtube className="mr-2 h-6 w-6 text-red-600" />
                Paste YouTube Video URL
              </FormLabel>
              <FormControl>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start">
                  <Input
                    placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    {...field}
                    className="text-base flex-grow h-12 focus:border-primary"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading} className="min-w-[150px] h-12 text-base w-full sm:w-auto bg-primary hover:bg-primary/90">
                    {isLoading ? "Processing..." : (
                      <>
                        <Send className="mr-2 h-5 w-5" /> Process Video
                      </>
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
