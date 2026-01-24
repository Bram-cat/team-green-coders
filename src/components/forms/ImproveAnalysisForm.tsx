'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Address } from '@/types/address';
import { ImproveResponse, ImproveAPIResponse } from '@/types/api';

interface ImproveAnalysisFormProps {
  onSuccess: (data: ImproveResponse) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function ImproveAnalysisForm({ onSuccess, onError, onLoadingChange }: ImproveAnalysisFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    postalCode: '',
    country: 'Canada',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!file) newErrors.file = 'Please upload an image of your solar installation';
    if (!address.street.trim()) newErrors.street = 'Street address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!address.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    onLoadingChange(true);

    try {
      const formData = new FormData();
      formData.append('image', file!);
      formData.append('street', address.street);
      formData.append('city', address.city);
      formData.append('postalCode', address.postalCode);
      formData.append('country', address.country);

      const response = await fetch('/api/improve', {
        method: 'POST',
        body: formData,
      });

      const result: ImproveAPIResponse = await response.json();

      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.error.message);
      }
    } catch (err) {
      onError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="image">Solar Installation Photo</Label>
        <FileUpload
          onFileSelect={setFile}
          error={errors.file}
        />
        <p className="text-sm text-muted-foreground">
          Upload a photo showing your existing solar panel installation
        </p>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Property Address</h3>

        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            type="text"
            placeholder="123 Main Street"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            error={errors.street}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="Charlottetown"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              error={errors.city}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              type="text"
              placeholder="C1A 1A1"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              error={errors.postalCode}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            type="text"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            error={errors.country}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Analyzing Installation...' : 'Analyze My Solar System'}
      </Button>
    </form>
  );
}
