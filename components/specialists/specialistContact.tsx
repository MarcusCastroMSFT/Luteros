import React from 'react';
import Image from 'next/image';
import { MapPin, Mail, Phone, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Specialist } from '@/types/specialist';
import { Card, CardContent } from '@/components/ui/card';

interface SpecialistContactProps {
  specialist: Specialist;
}

export function SpecialistContact({ specialist }: SpecialistContactProps) {
  return (
    <div className="sticky top-8 space-y-6">
      {/* Profile Card */}
      <Card className="overflow-hidden border-gray-200">
        <CardContent className="p-6">
          <div className="text-center">
            {/* Avatar */}
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-200 to-brand-secondary-200">
              <Image
                src={specialist.avatar}
                alt={specialist.name}
                fill
                className="object-cover"
              />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {specialist.name}
            </h3>
            <p className="text-gray-600 mb-4">
              {specialist.profession}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Me</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">PO Box 16122 Collins Street West Victoria</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">info@upskill.com</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">+89 (619) 076-2205</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">www.allfin.com</span>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Follow me</h5>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[var(--cta-highlight)] hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[var(--cta-highlight)] hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[var(--cta-highlight)] hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[var(--cta-highlight)] hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
