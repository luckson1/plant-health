import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  import { Button } from "@/components/ui/button"
  const plantsAndDiseases=[{plant: 'Tomato', diseases: ['Late blight',  'Early blight', 'Septoria leaf spot', 'Tomato Yellow Leaf Curl Virus', 'Bacterial spot', 'Target Spot', 'Tomato mosaic virus', 'Leaf Mold', 'Spider mites Two-spotted spider mite']}, {plant: 'Grape', diseases: [ 'Leaf blight (Isariopsis Leaf Spot)', 'Black rot', 'Esca (Black Measles)']}, {plant: 'Orange', diseases: ['Haunglongbing (Citrus greening)']}, {plant: 'Squash', diseases: ['Powdery mildew']}, {plant: 'Potato', diseases: [ 'Late blight', 'Early blight']}, {plant: 'Corn (maize)', diseases: ['Northern Leaf Blight', 'Cercospora leaf spot Gray leaf spot', 'Common rust ']}, {plant: 'Strawberry', diseases: ['Leaf scorch']}, {plant: 'Peach', diseases: [ 'Bacterial spot']}, {plant: 'Apple', diseases: ['Apple scab', 'Black rot', 'Cedar apple rust']}, {plant: 'Cherry (including sour)', diseases: ['Powdery mildew']}, {plant: 'Pepper, bell', diseases: [ 'Bacterial spot']}, ]
  export function Plants() {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='link'> 11 plants</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>List of plants and diseases covered by model</AlertDialogTitle>
            <AlertDialogDescription className=" flex flex-col space-y-5">
            <p className="text  font-medium text start"> The model can only predict diseases of only these 11 plants. Only upload leaf images of only these 11 plants. </p>
<div className="space-y-3">
    {plantsAndDiseases.map(p=> (
        <p key={p.plant} className="text-start">
            <span className="font-bold">{p.plant}: </span>{p.diseases.map(d=> <span> {" "} {" "} {p.diseases.indexOf(d)===p.diseases.length-1? d: `${d},`}  </span>)}
            </p>
    ))}
</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  