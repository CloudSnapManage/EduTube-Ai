"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Send } from "lucide-react";

const formSchema = z.object({
  videoUrl: z.string().url({ message: "Please enter a valid YouTube URL." })
    .refine(url => url.includes("youtube.com") || url.includes("youtu.be"), {
      message: "URL must be a valid YouTube link."
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
              <FormLabel className="text-lg">YouTube Video URL</FormLabel>
              <FormControl>
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...field}
                    className="text-base"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                    {isLoading ? "Processing..." : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Summarize
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
