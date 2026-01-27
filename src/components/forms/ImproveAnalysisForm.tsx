'use client';

import { useState } from 'react';
import { MultiImageUpload } from '@/components/forms/MultiImageUpload';
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
  const [images, setImages] = useState<File[]>([]);
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    postalCode: '',
    country: 'Canada',
  });
  const [actualPanelCount, setActualPanelCount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (images.length === 0) newErrors.images = 'Please upload at least one image of your solar installation';
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

      // Append all images
      images.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });
      formData.append('imageCount', images.length.toString());

      formData.append('street', address.street);
      formData.append('city', address.city);
      formData.append('postalCode', address.postalCode);
      formData.append('country', address.country);
      if (actualPanelCount) {
        formData.append('actualPanelCount', actualPanelCount);
      }

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
      {/* Multi-Image Upload */}
      <MultiImageUpload
        onChange={setImages}
        disabled={isLoading}
        maxImages={3}
      />
      {errors.images && (
        <p className="text-sm text-red-500 -mt-3">{errors.images}</p>
      )}

      {/* Actual Panel Count (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="actualPanelCount">Actual Panel Count (Optional)</Label>
        <Input
          id="actualPanelCount"
          type="number"
          min="1"
          max="100"
          placeholder="e.g., 42"
          value={actualPanelCount}
          onChange={(e) => setActualPanelCount(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          If you know the exact number of panels, enter it here to improve accuracy
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
          />
          {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
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
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              type="text"
              placeholder="C1A 1A1"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            />
            {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            type="text"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
          />
          {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
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
