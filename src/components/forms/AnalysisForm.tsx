'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Address } from '@/types/address';
import { AnalyzeResponse, AnalyzeAPIResponse } from '@/types/api';

interface AnalysisFormProps {
  onSuccess: (data: AnalyzeResponse) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function AnalysisForm({ onSuccess, onError, onLoadingChange }: AnalysisFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!file) newErrors.file = 'Please upload a roof image';
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

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result: AnalyzeAPIResponse = await response.json();

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roof Photo
        </label>
        <FileUpload
          onFileSelect={setFile}
          error={errors.file}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Property Address</h3>

        <Input
          label="Street Address"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          placeholder="123 Main Street"
          error={errors.street}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            placeholder="Los Angeles"
            error={errors.city}
          />
          <Input
            label="Postal Code"
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            placeholder="90001"
            error={errors.postalCode}
          />
        </div>

        <Input
          label="Country"
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          placeholder="United States"
          error={errors.country}
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? 'Analyzing your roof...' : 'Analyze my roof'}
      </Button>
    </form>
  );
}
