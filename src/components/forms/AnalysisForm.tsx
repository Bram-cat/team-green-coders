'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Label } from '@/components/ui/Label';
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
    country: 'Canada', // Default to Canada for PEI
  });
  const [monthlyBill, setMonthlyBill] = useState<string>('');
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
      if (monthlyBill) {
        formData.append('monthlyBill', monthlyBill);
      }

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
        <p className="mt-2 text-xs text-gray-500">
          Upload an aerial or angled photo of your roof. Google Maps satellite view works well.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Property Address</h3>
        <p className="text-sm text-gray-500 -mt-2">
          Enter your PEI property address for accurate solar estimates
        </p>

        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            placeholder="123 Queen Street"
          />
          {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              placeholder="Charlottetown"
            />
            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              placeholder="C1A 1A1"
            />
            {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            placeholder="Canada"
          />
          {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Energy Profile (Optional)</h3>
        <p className="text-sm text-gray-500 -mt-2">
          Help us calculate your exact savings
        </p>

        <div className="space-y-2 relative">
          <Label htmlFor="monthlyBill">Average Monthly Electricity Bill ($)</Label>
          <div className="relative">
            <Input
              id="monthlyBill"
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(e.target.value)}
              placeholder="150"
              type="number"
              min="0"
              className="pr-12"
            />
            <div className="absolute right-3 top-2.5 text-gray-500 text-sm">CAD</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            This tool is optimized for <strong>Prince Edward Island</strong> properties.
            Savings estimates are based on Maritime Electric rates and PEI solar conditions.
          </p>
        </div>
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
