'use client';

import { useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addCategory, updateCategory, deleteCategory } from '@/app/data/operations';
import type { Category } from '@/lib/types';

export function CategoryManager() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const categoriesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [user, firestore]);
  const { data: categories, isLoading } = useCollection<Category>(categoriesRef);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#8884d8');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddDialog = () => {
    setIsEditing(null);
    setCategoryName('');
    setCategoryColor(`#${Math.floor(Math.random()*16777215).toString(16)}`);
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setIsEditing(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName || !firestore || !user) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateCategory(firestore, user.uid, isEditing.id, { name: categoryName, color: categoryColor });
        toast({ title: 'Category Updated', description: `"${categoryName}" has been updated.` });
      } else {
        await addCategory(firestore, user.uid, { name: categoryName, color: categoryColor });
        toast({ title: 'Category Created', description: `"${categoryName}" has been added.` });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not save the category.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!firestore || !user) return;
    try {
      await deleteCategory(firestore, user.uid, categoryId);
      toast({ title: 'Category Deleted', description: 'The category has been successfully deleted.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not delete the category.', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>Add, edit, or delete your activity categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-md">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center p-3 border-b last:border-b-0">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="ml-3 flex-1 font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the "{category.name}" category. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details for your category.' : 'Create a new category to track your activities.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">Color</Label>
              <Input id="color" type="color" value={categoryColor} onChange={(e) => setCategoryColor(e.target.value)} className="col-span-3 h-10 p-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
