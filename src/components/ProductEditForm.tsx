import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Product } from './QuoteWorkflow';
import { Save, X, Edit } from 'lucide-react';

interface ProductEditFormProps {
  product: Product;
  onSave: (productId: string, updatedProduct: Product) => void;
  onCancel: () => void;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const [editedProduct, setEditedProduct] = useState<Product>({ ...product });

  const handleSpecChange = (field: string, value: string) => {
    setEditedProduct(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: value
      }
    }));
  };

  const handleBasicChange = (field: string, value: string | number) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(product.id, editedProduct);
  };

  return (
    <Card className="border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editing Product
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" variant="default">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button onClick={onCancel} size="sm" variant="outline">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={editedProduct.brand}
              onChange={(e) => handleBasicChange('brand', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={editedProduct.type}
              onChange={(e) => handleBasicChange('type', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={editedProduct.sku}
              onChange={(e) => handleBasicChange('sku', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={editedProduct.quantity}
            onChange={(e) => handleBasicChange('quantity', parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Specifications</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wattage">Wattage/Power</Label>
              <Input
                id="wattage"
                placeholder="e.g., 24W, 49.5W"
                value={editedProduct.specs?.wattage || ''}
                onChange={(e) => handleSpecChange('wattage', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dimming">Dimming</Label>
              <Input
                id="dimming"
                placeholder="e.g., Dimmable, Non-dimmable"
                value={editedProduct.specs?.dimming || ''}
                onChange={(e) => handleSpecChange('dimming', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="colorTemperature">Color Temperature</Label>
              <Input
                id="colorTemperature"
                placeholder="e.g., 3000K, 4000K"
                value={editedProduct.specs?.colorTemperature || ''}
                onChange={(e) => handleSpecChange('colorTemperature', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="e.g., White, Black"
                value={editedProduct.specs?.color || ''}
                onChange={(e) => handleSpecChange('color', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mountType">Mount Type</Label>
              <Input
                id="mountType"
                placeholder="e.g., Recessed, Surface-mounted"
                value={editedProduct.specs?.mountType || ''}
                onChange={(e) => handleSpecChange('mountType', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lumen">Lumen</Label>
              <Input
                id="lumen"
                placeholder="e.g., 2000, 4400"
                value={editedProduct.specs?.lumen || ''}
                onChange={(e) => handleSpecChange('lumen', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cri">CRI</Label>
              <Input
                id="cri"
                placeholder="e.g., >80, >90"
                value={editedProduct.specs?.cri || ''}
                onChange={(e) => handleSpecChange('cri', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                placeholder="e.g., D 214mm, 250mm x 215mm"
                value={editedProduct.specs?.dimensions || ''}
                onChange={(e) => handleSpecChange('dimensions', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Input
                id="direction"
                placeholder="e.g., Up/Down, Directional"
                value={editedProduct.specs?.direction || ''}
                onChange={(e) => handleSpecChange('direction', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* URL Field */}
        <div className="space-y-2">
          <Label htmlFor="url">Product URL (optional)</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/product"
            value={editedProduct.url || ''}
            onChange={(e) => handleBasicChange('url', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};